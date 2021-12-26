const Campground=require('../models/campground')
const {cloudinary}=require('../cloudinary')
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken=process.env.MAPBOX_TOKEN
const geocoder=mbxGeocoding({accessToken:mapBoxToken});
module.exports.index=async (req,res)=>{
    const campground= await Campground.find({})
    res.render('campgrounds/index',{campground})}


module.exports.renderNewForm=(req,res)=>{
   
    res.render('campgrounds/new')}    

module.exports.createCampground=async(req,res,next)=>{
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const campground=req.body.campground
    campground.geometry=geoData.body.features[0].geometry
    campground.images=req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.author=req.user._id;
    const c=new Campground(campground)
    await c.save()
    console.log(c)
    req.flash('success','Successfully created')
    res.redirect(`/campgrounds/${c._id}`)   
}
module.exports.showCampground=async(req,res)=>{
    const {id} = req.params;
    const campground=await Campground.findById(id).populate({path:'reviews',populate:{path:'author'}}).populate('author')
    console.log(campground)
    if(!campground)
    {
        req.flash('error','Cannot find required data')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})
}    

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params
    const campground = await Campground.findById(id);
    if(!campground)
    {
        req.flash('error','the campground is not available')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground=async(req,res)=>{
    const {id} = req.params
    const campground1=await Campground.findByIdAndUpdate(id,{...req.body.campground})
   const arr= req.files.map(f=>({url:f.path,filename:f.filename}))
    campground1.images.push(...arr)
    const cmp=await campground1.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }    
        const c=await cmp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
        console.log(c); 
    }
    req.flash('success','SuccessFully Edited')
    res.redirect(`/campgrounds/${cmp._id}`)
}

module.exports.deleteCampground=async(req,res)=>{
    const {id}=req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully Deleted')
    res.redirect('/campgrounds')
}