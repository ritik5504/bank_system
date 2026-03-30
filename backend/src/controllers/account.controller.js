const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");


async function createAccountController(req, res) {

    const user = req.user;
    const { initialAmount } = req.body;

    const account = await accountModel.create({
        user: user._id
    })

    // If initialAmount is provided, create a credit entry
    if (initialAmount && initialAmount > 0) {
        try {
            // Create a special transaction for initial funds
            const transaction = new transactionModel({
                fromAccount: account._id,  // System transfer, so both are same account initially
                toAccount: account._id,
                amount: initialAmount,
                idempotencyKey: `init-${account._id}-${Date.now()}`,
                status: "COMPLETED"
            })

            await transaction.save()

            // Create a CREDIT ledger entry for the initial amount
            await ledgerModel.create({
                account: account._id,
                amount: initialAmount,
                transaction: transaction._id,
                type: "CREDIT"
            })
        } catch (error) {
            console.error("Error adding initial funds:", error)
            // Don't fail the account creation if initial funds fail
        }
    }

    res.status(201).json({
        account
    })

}

async function getUserAccountsController(req, res) {

    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}


async function deleteAccountController(req, res) {
    const { accountId } = req.params;

    try {
        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        if (account.status === "CLOSED") {
            return res.status(400).json({
                message: "Account is already closed"
            });
        }

        // Check balance before deleting
        const balance = await account.getBalance();
        if (balance > 0) {
            return res.status(400).json({
                message: `Cannot delete account with remaining balance of $${balance.toFixed(2)}. Please transfer funds first.`
            });
        }

        // Set status to CLOSED
        account.status = "CLOSED";
        await account.save();

        res.status(200).json({
            message: "Account closed successfully"
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({
            message: "Failed to delete account"
        });
    }
}


module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    deleteAccountController
}