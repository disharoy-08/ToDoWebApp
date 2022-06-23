//jshint esversion:6

const express = require( 'express' );
const bodyParser = require ( 'body-parser' );
const mongoose = require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://disha-roy:Test123@cluster0.bzgnf.mongodb.net/todolistDB");

//Creating Schema for Item Model

const itemSchema = {
    name: String
  };
const Item = mongoose.model( "Item", itemSchema); //Creating Item model of itemSchema

 const item1 = new Item({
    name: "welcome to this to do list"
}); 

const defaultItems = [item1];


//Creating Schema for List Model

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema); //Creating Item model of listSchema


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (!err) {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});
  
app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){

        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+ customListName);          
      }else{
        // show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});


app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    //Creating New Schema
    const nitem = new Item({
      name: itemName
    });

    if(listName === "Today"){
      nitem.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(nitem);
        foundList.save();
        res.redirect("/"+ listName);
      });
    }
});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);

  if(listName === "Today"){
    Item.findByIdAndRemove( checkedItemId, function(err){
      if(!err){
        console.log("successfully deleted using id.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId }}} , function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
});


app.listen( 3000, function(){
    console.log("server is running on port number 3000");
});