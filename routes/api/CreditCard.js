var express = require("express");
var router = express.Router();
var CreditCard = require("../../modals/CreditCard");
const crypto = require("crypto");

const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", "yash");
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (text) => {
  // Make sure to require the crypto module
  const decipher = crypto.createDecipher("aes-256-cbc", "yash");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

// POST api to add credit card data
router.post("/addCreditCard", async (req, res) => {
  const { tenant_id, card_number, exp_date, card_type } = req.body;

  const cardNumber = encrypt(card_number.toString());

  try {
    // Check if the tenant_id already exists
    const existingCard = await CreditCard.findOne({ tenant_id });

    if (existingCard) {
      // Tenant exists, add new card details to card_detail array
      existingCard.card_detail.push({
        card_number: cardNumber,
        exp_date,
        card_type,
      });

      // Save the updated document
      await existingCard.save();

      res
        .status(200)
        .json({ message: "Credit card details added successfully." });
    } else {
      // Tenant doesn't exist, create a new entry
      const newCreditCard = new CreditCard({
        tenant_id,
        card_detail: [{ card_number: cardNumber, exp_date, card_type}],
      });

      // Save the new document
      await newCreditCard.save();

      res
        .status(201)
        .json({ message: "New credit card entry created successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET API to retrieve credit card data based on tenant_id
router.get("/getCreditCard/:tenant_id", async (req, res) => {
  const tenant_id = req.params.tenant_id;

  try {
    // Find the credit card data based on tenant_id
    const creditCardData = await CreditCard.findOne({ tenant_id });

    if (creditCardData) {
      // Decrypt the card number before sending the response
      const decryptedCardData = creditCardData.card_detail.map((card) => ({
        card_number: decrypt(card.card_number),
        exp_date: card.exp_date,
        card_type: card.card_type
      }));

      res.status(200).json(decryptedCardData);
    } else {
      res.status(404).json({
        message: "Credit card data not found for the provided tenant_id.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
