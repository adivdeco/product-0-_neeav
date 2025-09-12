const express = require('express')

const billsRouter = express.Router()



billsRouter.post('/add_bill', addNewBills)
billsRouter.put('/update_bill/:id', updateBill);
billsRouter.delete('/delete_bill/:id', deleateBill)




billsRouter.get('/find/:id', getBill)
billsRouter.get('/allBills', getAllBills)
