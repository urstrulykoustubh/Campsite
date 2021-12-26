if(process.env.NODE_ENV!="production")
{
    require('dotenv').config();
}
// console.log(process.env.CLOUDINARY_CLOUD_NAME)
// console.log(process.env.CLOUDINARY_KEY)
// console.log(process.env.CLOUDINARY_SECRET)
const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const Campground=require('./models/campground')
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')
const session=require('express-session')
const flash=require('connect-flash')
const ExpressError=require('./utils/ExpressError')
const Joi=require('joi')
const {campgroundSchema,reviewSchema}=require('./schemas')
const Review=require('./models/review')
const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')
const mongoSanitize=require('express-mongo-sanitize')
const MongoStore=require('connect-mongo')
// const helmet=require('helmet')
const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/memex';

mongoose.connect(dbUrl,{useNewUrlParser:true,useUnifiedTopology:true})
 .then(()=>{
     console.log("CONNECTION ESTABLISHED")
 })
 .catch((e)=>{
      console.log(e)  
 })

app.engine('ejs',ejsMate) 
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())
// app.use(helmet({contentSecurityPolicy:false}))
const secret=process.env.SECRET || 'thisshouldbeabettersecret!';
const sessionConfig={
    name:'session',
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    },
    store:MongoStore.create({
        mongoUrl:dbUrl,
        secret:secret,
        touchAfter: 24*60*60
    })
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
const validateCampground=(req,res,next)=>{
    
    const {error}=campgroundSchema.validate(req.body)
    if(error)
    {
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else
    next();
}
const validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body)
    console.log(error)
    if(error)
    {
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else
    next();
}

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error')
    res.locals.currentUser=req.user
    next();

})
app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err
    if(!err.message)
    err.message="something went wrong"
    res.status(statusCode).render('error',{err});
})

app.listen(3000,(req,res)=>{
    console.log("SERVING ON THE PORT 3000")
})
