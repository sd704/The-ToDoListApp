//Custom date module

// //module.exports = getDate;
// module.exports.getDate = getDate;//made a property so we can send multiple values
// //getDate() would call the function, getDate sends the function itself

// function getDate() {

//     const today = new Date();
//     const options = {
//         weekday: "long",
//         day: "numeric",
//         month: "long"
//     }

//     return today.toLocaleDateString("en-US", options);
// }

exports.getDate = function () {

    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    return today.toLocaleDateString("en-US", options);
}

// module.exports.getDateHindi = getDateHindi;
// function getDateHindi() {

//     const today = new Date();
//     const options = {
//         weekday: "long",
//         day: "numeric",
//         month: "long"
//     }

//     return today.toLocaleDateString("hi-IN", options);
// }

exports.getDateHindi = function () {

    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    return today.toLocaleDateString("hi-IN", options);
}