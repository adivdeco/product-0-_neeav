const express = require('express')
const { addNewBills, updateBill, deleateBill, getBill, getAllBills } = require('../controllers/billManager')
const billsRouter = express.Router()



billsRouter.post('/add_bill', addNewBills)
billsRouter.put('/update_bill/:id', updateBill);
billsRouter.delete('/delete_bill/:id', deleateBill)




billsRouter.get('/find/:billId', getBill)
billsRouter.get('/allBills', getAllBills)


module.exports = billsRouter
