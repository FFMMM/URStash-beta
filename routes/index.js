/*
 *Controls the flow of the whole website. What happens when what is clicked etc
 *
 */

var express = require('express');
var sanitize = require('mongo-sanitize');
var passport = require('passport');
var Book = require('../models/books');
var Account = require('../models/user');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'URstash' ,user: req.user });
});


/* Handle Login POST */
router.post('/login', passport.authenticate('local'), function(req, res) {
    
    res.redirect('/');

});

/* GET New User page. */
router.get('/login', function(req, res) {
    res.render('login', { title: 'Login/Signup' ,user:req.user });
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

/* Handle Registration POST */
router.post('/signup', function(req,res){
    Account.register(
        new Account({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname ,
            phonenumber:req.body.phonenumber
            
        }),req.body.password , function(err, account) { 
            if (err) {
                    console.log('Error registering')
                     return res.render("register", {info: "Sorry. That email already exists. Try again."});
                    //return res.render('login', { account : account });
                }

            passport.authenticate('local')(req, res, function () {
                    console.log('Error forwarding');
                    res.redirect('/');
                });    
    } );
});



/* GET Search Results page. */
router.get('/searchResults', function(req, res) {
    //var db = req.db;
    //var collection = db.get('bookItems');
    //First search
    Book.find({},{},
     function(err,items){
        console.log(items);
        res.render('searchResults', {
            "searchResults" : items
        });

    });
});


/* post Search Results page. */
router.post('/search', function(req, res) {
    //Get the query and sanitize
    var searchQuery = sanitize(req.body.searchItem);
    
    //See how the check boxes are set up
    var options = req.body.options;
        
    if( options === "books"){
       
        //Search by name "Relevance" search
        console.log("Query is " + searchQuery);
        //collection.createIndex({Name : "text"});
        

        Book.textSearch(searchQuery, {sort:{ Price: 1, Condition: -1 } }, 
            function(err, output){
                if(!err){
                    console.log(output);
                    res.render('search', {
                            "search" : output
                        });
                    }else{
                        console.log("ERROR"+ err);
                    } 

        } );                
            
            /*
            Book.find( 
            {
                $text : {$search: searchQuery}
            } ,
            { 
                score: { $meta: "textScore" }
               // ,limit:4
                 //sort: { score: { $meta: "textScore" } }
                
             },

               function(err,items){
                //log the items
                //items = items.sort(  { Name:-1 });
               //  items = items.sort(  {score: { $meta: "textScore" } });
                    if(!err){
                    console.log(items);
                    res.render('search', {
                            "search" : items
                        });
                    }else{
                        console.log("ERROR"+ err);
                    }
                }
             );
            */
          

    }else if( options === "electronics"){
        var collection = db.get('electronicItems');
        
    }

});




/* GET New User page. */
router.get('/newItem', function(req, res) {
    if(!req.user){
        res.render('login', { title: 'Login/Signup', message:"Please login!"} )
    }
    res.redirect('newItem', { title: 'Sell an Item' });
});

/* POST to Add User Service */
router.post('/addItem', function(req, res) {

  

    // Get our form values. These rely on the "name" attributes

    var bookName = req.body.bookname;
    var bookAuthor = req.body.bookauthor;
    var bookISBN = req.body.bookisbn;
    var bookCondition = req.body.bookcondition;
    var bookPrice = req.body.bookprice;

   

    // Submit to the DB
    var item = new Book({
        "Name" : bookName,
        "Author" : bookAuthor,
        "ISBN" : bookISBN,
        "Condition": bookCondition,
        "Price": bookPrice
    });

    item.save(function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /addItem
            res.location("searchResults");
            // And forward to success page
            res.redirect("searchResults");
        }
    });
});




module.exports = router;