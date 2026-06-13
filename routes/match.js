const express = require('express');
const router = express.Router();
const { calculateMatch } = require('../services/matchService');

// GET /match/:poNumber
router.get('/:poNumber', async (req, res) => {
  try {
    const { poNumber } = req.params;
    
    // Call the matching engine
    const matchResult = await calculateMatch(poNumber);
    
    res.status(200).json(matchResult);

  } catch (error) {
    console.error("Match Engine Error:", error);
    res.status(500).json({ error: 'Failed to calculate match status' });
  }
});

module.exports = router;