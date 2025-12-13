import React from 'react'
import BlogCard from './BlogCard'

const BlogSection = () => {
    const blogs=[
        {
            publisherName:'karim',
            img:'/pic-6.jpg',
publishedAt: Date.now(),
            title:'frontend track',
            description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id natus, laborum temporibus ut quibusdam unde.',
        
        },
        {
            publisherName:'karim',
            img:'/pic-6.jpg',
publishedAt: Date.now(),
            title:'frontend track',
            description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id natus, laborum temporibus ut quibusdam unde.',
        
        },
        {
            publisherName:'karim',
            img:'/pic-6.jpg',
publishedAt: Date.now(),
            title:'frontend track',
            description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id natus, laborum temporibus ut quibusdam unde.',
        
        },
        {
            publisherName:'karim',
            img:'/pic-6.jpg',
publishedAt: Date.now(),
            title:'frontend track',
            description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id natus, laborum temporibus ut quibusdam unde.',
        
        },
        {
            publisherName:'karim',
            img:'/pic-6.jpg',
publishedAt: Date.now(),
            title:'frontend track',
            description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id natus, laborum temporibus ut quibusdam unde.',
        
        },
        {
            publisherName:'karim',
            img:'/pic-6.jpg',
publishedAt: Date.now(),
            title:'frontend track',
            description:'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id natus, laborum temporibus ut quibusdam unde.',
        
        },
    ]
  return (
    <div className='my-12 flex flex-col gap-6 w-full'>
        <div className='flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3'>
            {
                blogs.map((blog)=>{
                    return(
                             <BlogCard key={blog.title} blog={blog}/>
     
                    )
                })
            }
        </div>
    </div>
  )
}

export default BlogSection
