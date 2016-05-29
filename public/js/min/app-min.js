angular.module("budgetApp",["ngRoute"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"/temps/frontPage.temp.html",controller:"FrontPageController"}).when("/viewAll",{templateUrl:"/temps/all.temp.html",controller:"ViewAllPageController"}).when("/edit/:recurrence/:creationDate",{templateUrl:"/temps/edit.temp.html",controller:"EditPageController"}).when("/createNew",{templateUrl:"/temps/new.temp.html",controller:"CreationController"})}]);var budgetApp=angular.module("budgetApp");budgetApp.controller("FrontPageController",["$scope","$location","expensesService",function(a,b,c){a.remainingPay=0,a.netPay=900,a.goTo=function(a){b.path(a)},c.refreshExpenses().then(function(){c.getFilteredExpenses().then(function(b){a.expenses=b.expenses,a.paycheckStart=new Date(b.paycheckStart),a.paycheckEnd=new Date(b.paycheckEnd),a.recalculateTotal()})}),a.updatePaycheck=function(){var b=moment(a.paycheckStart).format("YYYY-MM-DD");c.getFilteredExpenses(b).then(function(b){a.expenses=b.expenses,a.paycheckStart=b.paycheckStart,a.paycheckEnd=b.paycheckEnd,a.recalculateTotal()})},a.recalculateTotal=function(){a.total=a.expenses.reduce(function(a,b){return a+parseFloat(b.amount)},parseFloat(a.expenses[0].amount)),a.total+=a.remainingPay}}]),budgetApp.controller("ViewAllPageController",["$scope","$location","expensesService",function(a,b,c){a.goTo=function(a,c,d){"edit"===a?b.path(a+"/"+c+"/"+encodeURIComponent(d)):b.path(a)},c.getExpenses().then(function(b){a.expenses=b})}]),budgetApp.controller("EditPageController",["$scope","$location","$http","$routeParams","expensesService","schemas",function(a,b,c,d,e,f){var g=d.recurrence,h=d.creationDate;a.goTo=function(a){b.path(a)},a.globalFields=f.getSchema("globalFields"),a.recurrenceTypes=f.getSchema("recurrenceTypes"),a.calculatedFields=f.getCalculatedFields(g),e.getExpense(g,decodeURIComponent(h)).then(function(b){a.expense=b||null})["catch"](function(a){console.error(a)}),a.updateFields=function(){a.calculatedFields=f.getCalculatedFields(a.expense.recurrence)},a.deleteExpense=function(){c({method:"DELETE",url:"/api/deleteExpense",headers:{"Content-Type":"application/json"},data:{primary:g,secondary:decodeURIComponent(h)}}).then(function(){e.refreshExpenses().then(function(){a.goTo("/viewAll")})})["catch"](function(a){console.error(a)})},a.updateExpense=function(){if(g!==a.expense.recurrence){var b={recurrence:a.expense.recurrence,creationDate:h};a.globalFields.forEach(function(c){b[c.name]=a.expense[c.name]}),a.calculatedFields.fields.forEach(function(c){b[c.name]=a.expense[c.name]}),c({method:"POST",url:"/api/createExpense",headers:{"Content-Type":"application/json"},data:b}).then(function(){a.deleteExpense()})["catch"](function(a){console.error(a)})}else c({method:"POST",url:"/api/updateExpense",headers:{"Content-Type":"application/json"},data:a.expense}).then(function(){e.refreshExpenses().then(function(){a.goTo("/viewAll")})})["catch"](function(a){console.error(a)})}}]),budgetApp.controller("CreationController",["$scope","$location","$http","schemas",function(a,b,c,d){a.recurrence=void 0,a.globalFields=d.getSchema("globalFields"),a.recurrenceTypes=d.getSchema("recurrenceTypes"),a.goTo=function(a){b.path(a)},a.updateFields=function(b){a.calculatedFields=d.getCalculatedFields(b)},a.saveExpense=function(){var b={recurrence:a.recurrence,creationDate:(new Date).toISOString()};a.globalFields.forEach(function(a){b[a.name]=a.value}),a.calculatedFields.fields.forEach(function(a){b[a.name]=a.value}),c({method:"POST",url:"/api/createExpense",headers:{"Content-Type":"application/json"},data:b}).then(function(){a.goTo("/")})["catch"](function(a){console.error(a)})}}]);var budgetApp=angular.module("budgetApp"),budgetApp=angular.module("budgetApp");budgetApp.service("expensesService",["$http","$q",function(a,b){var c=this;this.refreshExpenses=function(){return a.get("/api/getAllExpenses").then(function(a){return c.expenses=a.data,c.expenses})},this.getExpenses=function(){return c.expenses?b.when(c.expenses):c.refreshExpenses()},this.getFilteredExpenses=function(c){return c?/\d{4}-\d{2}-\d{2}/.test(c)?a.get("/api/getExpensesStarting/"+c).then(function(a){return a.data}):b.reject("Invalid date format. Must follow the format YYYY-MM-DD"):a.get("/api/getExpensesThisPaycheck").then(function(a){return a.data})},this.getExpense=function(a,d,e){var f=b.defer(),g=_.find(c.expenses,function(b){return b.recurrence===a&&b.creationDate===d});return g?f.resolve(g):e?f.reject("Expense not found in refreshed expense list"):c.refreshExpenses().then(function(){f.resolve(c.getExpense(a,d,!0))}),f.promise}}]),budgetApp.service("schemas",function(){var a={};this.getSchema=function(b){return _.cloneDeep(a[b])},this.getSchemas=function(b){var c={};return b.forEach(function(b){c[b]=_.cloneDeep(a[b])}),c},this.getCalculatedFields=function(b){return _.find(a.recurrenceTypes,function(a){return a.name===b})},a.globalFields=[{name:"amount",type:"number",step:"0.01",value:void 0},{name:"payee",type:"text",value:void 0},{name:"purpose",type:"text",value:void 0}],a.recurrenceTypes=[{name:"paycheck",fields:[]},{name:"monthly",fields:[{name:"day_of_month",type:"number",step:"1",value:void 0}]},{name:"monthly-on",fields:[{name:"day_of_week",options:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],value:void 0},{name:"which",type:"number",step:"1",value:void 0}]},{name:"yearly",fields:[{name:"day_of_month",type:"number",step:"1",value:void 0},{name:"month",options:["January","February","March","April","May","June","July","August","September","October","November","December"],value:void 0}]},{name:"one-off",fields:[{name:"date",type:"date",value:void 0},{name:"paid",type:"checkbox",value:!1}]}]});