const mongoose=require('mongoose')
const Campground=require('../models/campground')
const cities=require('./cities')
const {descriptors,places}=require('./seedHelpers')
mongoose.connect('mongodb://localhost:27017/memex',{useNewUrlParser:true,useUnifiedTopology:true})
 .then(()=>{
     console.log("CONNECTION ESTABLISHED")
 })
 .catch((e)=>{
      console.log(e)  
 })

 function sample(array){
     const idx=Math.floor(Math.random()*array.length)
     return array[idx];
 }
 const seedDb= async()=>{
     await Campground.deleteMany({})
     for(let i=0;i<200;i++)
     {
         const idx=Math.floor(Math.random()*1000);
         const price=Math.floor(Math.random()*30)+10;
         const camp=new Campground({
         //MY USER ID    
         author:'61c5fe58848ef98bf44cb5d8',
         location:`${cities[idx].city} ${cities[idx].state}`,
         title:`${sample(descriptors)} ${sample(places)}`,
         images:[
            {
                url: 'https://res.cloudinary.com/dzgdagzwf/image/upload/v1640424271/YelpCamp/ojljvd5bsnv0w9qz3uz5.jpg',
                filename: 'YelpCamp/ojljvd5bsnv0w9qz3uz5',
               
              }
          
         ],
         description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae laudantium maxime dolores, dolor totam, placeat sunt neque id natus, officiis rerum quo minus aperiam dicta omnis molestiae saepe quia ipsum?',
         price,
         geometry:{
             type: "Point",
             coordinates:[cities[idx].longitude,cities[idx].latitude]
         }
        })
         await camp.save()
     }

 }

 seedDb().then(()=>{
     mongoose.connection.close();
 });