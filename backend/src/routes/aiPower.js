
const express = require('express');
const Airouter = express.Router();
const { GoogleGenAI } = require("@google/genai");


const ai = new GoogleGenAI({});


Airouter.post('/', async (req, res) => {

    const formData = req.body;
    const { length, breadth, floors, constructionType, location, amenities, timeline } = formData;

    if (!length || !breadth || !floors || !constructionType || !location || !timeline || !amenities) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters for estimation.'
        });
    }

    try {
        const area = length * breadth;
        const totalArea = area * floors;


        const baseRates = {
            'economy': 1200,
            'standard': 1800,
            'premium': 2500,
            'luxury': 4000
        };


        const locationMultipliers = {
            'rural': 0.9,
            'suburban': 1.0,
            'urban': 1.2,
            'metro': 1.5
        };


        const baseCost = totalArea * baseRates[constructionType];
        const locationAdjusted = baseCost * locationMultipliers[location];

        const amenitiesCost = Array.isArray(amenities) ? amenities.length * 50000 : 0;

        // Calculate timeline multiplier (assuming timeline is in months, 12 months is standard)
        const parsedTimeline = parseInt(timeline);
        const timelineMultiplier = 1 + (12 - parsedTimeline) * 0.05; // 5% cost increase per month saved
        const timelineAdjusted = locationAdjusted * timelineMultiplier;

        const totalCostBeforeContingency = timelineAdjusted + amenitiesCost;
        const contingency = totalCostBeforeContingency * 0.08;

        const estimate = {
            baseCost: Math.round(baseCost),
            locationAdjustment: Math.round(locationAdjusted - baseCost),
            amenitiesCost: amenitiesCost,
            timelineAdjustment: Math.round(timelineAdjusted - locationAdjusted),
            contingency: Math.round(contingency),
            totalCost: Math.round(totalCostBeforeContingency + contingency),
            totalArea: totalArea,
            costPerSqFt: Math.round((totalCostBeforeContingency + contingency) / totalArea)
        };



        let aiFeedback = "";

        const prompt = `You are a helpful and expert construction project advisor. Analyze the following 
        construction estimate and project details. Provide a concise, professional, and actionable feedback/advice.
         Focus on material costs, timeline feasibility, and potential risks.

Project Details: ${JSON.stringify(formData)}
Financial Estimate: ${JSON.stringify(estimate)}

Provide your advice in a paragraph of no more than 150 words.`;



        const streamResult = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        for await (const chunk of streamResult) {
            if (chunk.text) {
                aiFeedback += chunk.text;
            }
        }


        res.status(200).json({
            success: true,
            estimate: estimate,
            aiFeedback: aiFeedback.trim()
        });

    } catch (error) {
        console.error('Estimation or AI generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating estimate or AI feedback',
            error: error.message
        });
    }
});

module.exports = Airouter;