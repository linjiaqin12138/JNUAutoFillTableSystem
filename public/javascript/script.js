// // x axis data
// var lineChartData = {
//     labels: ["2","4","6","8","10","12","14","16","18","20","22","24"],
//     datasets: [
//         {
//              fillColor: "rgba(255,255,255,0)",
//              strokeColor: "rgba(0,0,0,1)",
//              pointColor: "rgba(155,39,30,1)",
//              pointStrokeColor: "#fff",
//              pointHighlightFill: "#fff",
//              pointHighlightStroke: "rgba(200,220,220,1)",
//              data: [1,2,3,4,5,5,6,7,8,8,9,9]
//         },
//         {
//             fillColor: "rgba(255,255,255,0)",
//             strokeColor: "rgba(92,184,92,1)",
//             pointColor: "rgba(23,126,23,1)",
//             pointStrokeColor: "#fff",
//             pointHighlightFill: "#fff",
//             pointHighlightStroke: "rgba(151,187,205,1)",
//             data: [2,2,1,4,2,4,5,7,8,8,4,3]
//        }
//     ]
// }
// window.onload = function(){
//     var ctx = document.getElementById("canvas").getContext("2d");
//     window.myLine = new Chart(ctx).Line(lineChartData,{
//             responsive:true
//         });
// }
var ctx = document.getElementById('canvas').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45]
        }]
    },

    // Configuration options go here
    options: {}
});