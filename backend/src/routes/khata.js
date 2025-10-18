const express = require('express')
const { addNewBills, updateBill, deleateBill, getBill, getAllBills } = require('../controllers/billManager')
const billsRouter = express.Router()



billsRouter.post('/add_bill', addNewBills)
billsRouter.put('/update_bill/:billId', updateBill);
billsRouter.delete('/delete_bill/:billId', deleateBill)




billsRouter.get('/find/:billId', getBill)
billsRouter.get('/allBills', getAllBills)


module.exports = billsRouter
