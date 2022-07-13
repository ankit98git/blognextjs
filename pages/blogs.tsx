import { gql, useQuery } from '@apollo/client';
import type { NextComponentType, NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import client from '../apollo-client';
import styles from './blogs.module.css';
import axios from 'axios';
import { parser } from 'html-metadata-parser'
import Image from 'next/image';
import useWindowSize, { Size } from '../size';

const query = client.watchQuery({
  query: gql`
  query ($cursor: Int!)  {
    retrievePageArticles(page: $cursor) {
      id
      author
      createdAt
      score
      updatedAt
      title
      text
      type
      url
    }
  }
  `,
  // first fetch, no cursor provided
  variables: { cursor: null },
});
function useFetch(str: string) {
  const { data, error, loading } = useQuery(gql`
  ${str}
  `);

  return {
    data, error, loading
  }
}

let page = 1

const Blogs: NextPage = (props) => {

  //const [page, setPage] = useState(1)

  const { data, error, loading } = useFetch(`query {
    firstPageArticles {
      id
      author
      createdAt
      score
      updatedAt
      title
      text
      type
      url
    }
  }`);

  const [posts, setPosts] = useState<Array<any>>([]);

  useEffect(() => {
    if (loading) return

    setPosts((prev: Array<any>) => [...prev, ...data.firstPageArticles])

  }, [loading]);

  useEffect(() => {
    let added = false
    const onScroll = function () {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if(added) return
        added = true
        query.fetchMore({
          variables: { cursor: page++ },
          
          // concatenate old and new entries
          updateQuery: (previousResult, { fetchMoreResult }) => {
            added = false
            setPosts((e)=>[...e, ...fetchMoreResult.retrievePageArticles])
            
          },
        });
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, []) 

  useEffect(() => console.log(posts), [posts])


  if (loading) return <p>Loading</p>

  if (error) return <p>errored</p>

  return (
    <div className={styles.container}>
      {!loading && <>
        <List posts={posts} />
      </>
      }
    </div>
  )
}

function useFetchImage(url : any) {

  const [srcLink, setSrcLink] = useState<string>('https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Wonderful_Nature_Beauty.jpg/1200px-Wonderful_Nature_Beauty.jpg')

  useEffect(() => {
    (async () => {
      try {
        const result = await parser(`https://nextjs-cors-anywhere.vercel.app/api?endpoint=`+url);//`https://nextjs-cors-anywhere.vercel.app/api?endpoint=`+
        setSrcLink(result?.og?.image ?? "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Wonderful_Nature_Beauty.jpg/1200px-Wonderful_Nature_Beauty.jpg")
      }catch(error) {

      }
      
    })()
  }, [url])

  return {srcLink}
}

function ImageFetch<NextComponentType>({ url } : any) {
  const { srcLink } = useFetchImage(url)

  return (<Image className={styles.imgContainer2} width={"500"} height={"500"} src={"https://res.cloudinary.com/demo/image/fetch/"+srcLink} alt="data" />)
}

function List<NextComponentType>({ posts }: any) {

  return (<>
    {posts.map((data: any, i: number) => {
      return (<div key={`i_${i}`} style={{
        marginBottom: "20px",
        marginTop: "20px"
      }}> 
      <div className={styles.listContainer}>
        <div className={styles.imgcontainer}>
          <ImageFetch url={data.url} alt="heading"/>
        </div>
        
        <div className={styles.textContainer}>
          <h1>{data.title}</h1>
          <p>{data.text}</p> 
          <a style={{
            marginTop: "30px",
            fontSize: "16px",
            lineHeight: "20px"
          }} href={data.url}><b style={{textDecoration: "underline", marginBottom: "10px", letterSpacing: "3px"}}>READ THIS ARTICLE</b></a> 
        </div>
      </div>
      </div>)
    })}</>)

}

export default Blogs