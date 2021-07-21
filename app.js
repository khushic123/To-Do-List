const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var DAYS=["Sunday","Monday","Tuesday","Wednesday","Thrusday","Friday","Saturday"];
//NOW WE WILL USE DATABASE INSTEAD OF ARRAYS

const itemsSchema = new mongoose.Schema({
  name: String,
});


const Item = mongoose.model('Item', itemsSchema);

// const item1=new Item(
//   {
//     name: "welcome",
//   }
// )
// const item2=new Item(
//   {
//     name: "hey i am khushi",
//   }
// )
// const item3=new Item(
//   {
//     name: "i am ugly!",
//   }
// )



const default_items=[];
const listSchema=new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model('List', listSchema);


// var items=[];
// var work_items=[];
//we use ejs so that we dont haveto create same html pages many times
app.set('view engine','ejs');
app.get("/",function(req,res){
  var date=new Date();
  var day=date.getDay();
  console.log(day);
  var curr_day=DAYS[day];
  var options={
     weekday: "long",
    month: "long",
    day: "numeric",
  }
  var curr_day=date.toLocaleDateString("en-US", options);
  

  Item.find(function(err,items){
    // if(err)
    // console.log(err);
    // else
    // {
    //     if(items.length==0)
    //     {
    //       Item.insertMany(default_items,function(err){
    //         if(err)
    //         console.log(err);
    //         else
    //         console.log("inseretd successfully");
    //         });
    //     }
        
            res.render("list",{ list_title: "today",
              newlist: items,
             });
});
});

app.post("/",function(req,res){
  console.log(req.body);
    var item=req.body.event;
   console.log(item);
   const newitem1=new Item({
        name: item,
   });

  if(req.body.list=="today")
  {
   newitem1.save();
   res.redirect("/");
  }
  else
  {
      List.findOne({name:req.body.list},function(err,foundedlist){
               if(foundedlist)
               {
               foundedlist.items.push(newitem1);
               foundedlist.save();
               res.redirect("/"+req.body.list);
               }
      });

  }



    });
  


app.post("/delete",function(req,res){
    const del_item=req.body.checkbox;
    const listname=req.body.listname;
  if(listname=="today")
  {
   Item.findByIdAndRemove(del_item, function(err){
       if(!err)
       console.log("success");
       res.redirect("/");
   })
  }
  else
  {
        List.findOneAndUpdate({name: listname},{$pull: {items:{_id: del_item}}},function(err){
          console.log("success");
          res.redirect("/"+listname);
        });
  }
});

app.get("/:customlist",function(req,res){
    const customlistname=req.params.customlist;
    console.log(customlistname);
    List.findOne({name:customlistname},function(err,foundedlist){
                 if(!foundedlist)
                 {
                  const list=new List(
                    {
                      name: customlistname,
                      items: default_items,
                    }
                  )
                  list.save();
                  res.render("list",{ list_title: list.name,
                    newlist: list.items,
                 });
                }
                 else
                 {
                  res.render("list",{ list_title: foundedlist.name,
                    newlist: foundedlist.items,
                   });
                 }
    })
    
});




app.get("/about",function(req,res){
  res.render("about");
});

app.listen(3000,function(){
  console.log("server started at port 3000");
});