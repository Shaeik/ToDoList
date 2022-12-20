//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ =require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set("strictQuery", false);

const url=require(__dirname+"/constants.js");
// console.log(url.uri)
// mongoose.connect(uri, () => {
//   console.log("Connected to MongoDB");
// });
mongoose.connect(url.uri)
const itemsSchema = {
  name:String
}
const listSchema ={
  name:String,
  items:[itemsSchema]
}

const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema)

const item1= new Item({name:"Buy Food"})
const item2= new Item({name:"Cook Food"})
const item3= new Item({name:"Eat Food"})
let defaultArray=[item1,item2,item3]


app.get("/", function(req, res) {
  
  Item.find({},(err,docs)=>{
    if(docs.length){
      defaultArray=docs;
      
    }
    else{
      
      Item.insertMany(defaultArray,(err,docs)=>{
        if (err){
          console.log(err)
        }
        else{
          defaultArray=docs
          //          mongoose.connection.close();
        }
        
      })
    }
    res.render("list", {listTitle: "Today", newListItems: defaultArray});
    
  })

  



});

app.get("/:customListName",(req,res)=>{
  const customListId = _.capitalize( req.params.customListName);
  List.findOne({name:customListId},(err,results)=>{
    if(!err){

      if(results){
          res.render("list",{listTitle:customListId,
      newListItems:results.items})  }
  
      else{
    
        const newList= new List({
          name:customListId,
          items:defaultArray
        })
      
        newList.save();
        res.redirect("/"+customListId);
      }

    }
  })
  
 // res.render("about",{items:req.params.customListName})
})
app.post("/", function(req, res){


  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name:itemName
  })
  if (listName === "Today"){
    newItem.save();
    res.redirect("/")

  }
  else{

    List.findOne({name:listName},(err,results)=>{
      results.items.push(newItem);
      results.save()
      res.redirect("/"+listName);
    })
  }

});
app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName= req.body.list;
  if (listName==="Today"){
    Item.findByIdAndDelete(checkedItemId,(err,results)=>{})

    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,results)=>{res.redirect("/"+listName)})
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
