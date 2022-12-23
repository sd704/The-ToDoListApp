const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const date = require(__dirname + "/date.js");
//Adding our custom module

let itemlist = ["Eat", "Sleep", "Study"];
//Storing all ToDo items in an array

app.set("view engine", "ejs");//Tells our app to use ejs as its view engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//We need to explicitly tell express to look for static files(CSS) in this folder

//"mongodb://127.0.0.1:27017/todolistDB"
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const taskSchema = {
    name: String
};

const Task = mongoose.model("Task", taskSchema);

//Initial list items
const task1 = new Task({
    name: "Welcome to The ToDoList App!"
});

const task2 = new Task({
    name: "👈 Click to delete an item"
});

const task3 = new Task({
    name: "Click '➕' button to add an item"
});

const defaultTaskList = [task1, task2, task3];

const listSchema = {
    name: String,
    dateCreated: String,
    tasks: [taskSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Task.find(function (err, tasks) {//Getting all items from mongo db
        if (tasks.length == 0) {//To insert initial default tasks only once
            Task.insertMany(defaultTaskList, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Saved all tasks.");
                }
            });
            res.redirect('/');
        } else {
            //res.render() -> Uses the view engine(which we set up earlier) to render a particular page
            //The ejs files should be kept in a 'views' folder
            res.render("list", { currentDay: date.getDate(), items: tasks, listTitle: "" });
            //Here "list" is the list.ejs file in views folder
        }
    });
});

app.get("/all_lists", function (req, res) {
    List.find(function (err, taskLists) {
        res.render("all_lists", { currentDay: date.getDate(), items: taskLists });
    });
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    setTimeout(() => {

        //Using findOne() to check if list already exists
        List.findOne({ name: customListName }, function (err, foundList) {
            if (err) {
                console.log(err);
            } else if (foundList) {
                //console.log("List already exists.");

                //Rendering the existing list
                res.render("list", { currentDay: date.getDate(), items: foundList.tasks, listTitle: foundList.name });
            } else if (!foundList) {
                //console.log("List doesn't exists.");

                //Making a new list of name given by the user
                const list = new List({
                    name: customListName,
                    dateCreated: date.getDate(),
                    tasks: defaultTaskList
                });
                list.save();
                res.redirect("/" + customListName);
            }
        });
    }, 50)
});

app.post("/", function (req, res) {
    const item = req.body.newItem;//newItem <- Text Inputfield name
    const listName = req.body.button;//submit button is set with listName

    if (item != "") {
        const newtask = new Task({
            name: item
        });

        if (listName === "") {
            //For default list
            newtask.save();
        } else {
            //for custom list
            List.findOne({ name: listName }, function (err, foundList) {
                foundList.tasks.push(newtask);
                foundList.save();
            });
        }
        console.log("Task added successfully.")
    }
    res.redirect("/" + listName);
});

app.post("/delete", function (req, res) {
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;//hidden input tag

    if (listName === "") {
        Task.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Task deleted successfully.")
                res.redirect('/');
            }
        });
    } else {
        //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
        //https://www.mongodb.com/docs/manual/reference/operator/update/pull/

        List.findOneAndUpdate({ name: listName }, { $pull: { tasks: { _id: checkedItemId } } }, function (err, foundList) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/' + listName);
            }
        });
    }
});

app.post("/deleteList", function (req, res) {
    const listId = req.body.checkbox;
    List.findByIdAndDelete(listId, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("List deleted");
        }
    });
    res.redirect('/all_lists');
});

app.post("/createList", function (req, res) {
    const newListName = req.body.newItem;//newItem <- Text Inputfield name
    res.redirect('/' + newListName);
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running.");
});