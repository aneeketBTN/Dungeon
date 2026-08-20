/*
 * Regression fixture for `tools/check-lesson-lecture-match.mjs`.
 *
 * These are the two SCLM module-2 lessons exactly as they shipped before
 * 2026-08-18, reproduced verbatim. Both taught the wrong lecture:
 *
 *   SCLM-M02-L03  taught L04's method families and error metrics. Its own lecture
 *                 (*Forecasting Features*) teaches the four features common to all
 *                 forecasts, the elements of a good forecast, and the six-step
 *                 process — none of which appears here. `MAD` and `MAPE` occur in
 *                 L04's transcript and not once in L03's.
 *
 *   SCLM-M02-L04  opened on L02's push/pull material and covered only the demand
 *                 components, so the *forecast accuracy* half of a lecture titled
 *                 "Demand Components and Forecast Accuracy" was taught by nothing.
 *
 * They are kept so the gate can be shown to fire on a real defect rather than on a
 * synthetic one. A gate that has never been demonstrated failing is a gate nobody
 * has tested. Run:
 *
 *   node tools/check-lesson-lecture-match.mjs "<transcripts>" \
 *        --lessons tests/fixtures/mismapped-lessons.js
 *
 * and expect both to be FLAGGED. QUALITY-LOG I54.
 */
(function (window) {
  "use strict";
  window.T6_LESSONS = {

    "SCLM-M02-L03": {
      lectureId: "SCLM-M02-L03",
      courseId: "SCLM",
      module: 2,
      order: 3,
      title: "Forecasting methods and error metrics",
      objective: "Choose between qualitative and quantitative methods, apply the multiplicative seasonal model, and read MAD, MSE and MAPE.",
      explainer: [
        "Forecasting methods divide into two families. Qualitative methods rest on human judgement — the Delphi method, executive opinion — and earn their place where there is no usable history, as with a genuinely new product. Quantitative methods use mathematical models over historical data: time series and linear regression. Collaborative forecasting is the practice of getting supply chain partners to align around one shared view of demand instead of each maintaining a private forecast, which is what stops the same order being planned for three different quantities at three stages.",
        "For seasonality, the multiplicative model is preferred in supply chain work, and the reason is structural. It treats a seasonal factor as a proportion of the baseline, so when the business grows the seasonal surge grows with it. An additive model would add the same absolute quantity every year regardless of how large the base had become, which understates the peak in a growing business exactly when getting the peak right matters most.",
        "Three error metrics judge how a model is doing, and they answer different questions. Mean absolute deviation is the average error size regardless of direction, in physical units, which makes it easy to interpret. Mean squared error squares errors before averaging, so it punishes a few large misses far more than many small ones — the right choice when one big miss is what hurts. Mean absolute percentage error states error as a percentage, which is what allows comparison across products selling in completely different volumes. Bias is separate from all three: it is error with direction kept, and a model can have small MAD and still be consistently under-forecasting."
      ],
      worked: {
        setup: "Two products, one selling thousands of units a month and one selling dozens, need their forecast accuracy compared.",
        move: "Use mean absolute percentage error rather than mean absolute deviation.",
        because: "MAD is expressed in physical units, so the high-volume product will show a larger absolute error simply because it is larger, whatever the model quality. MAPE states error as a percentage of actual demand, which normalises for volume and is the metric the course names for comparing across products with different sales volumes."
      },
      glossary: [
        {term: "quantitative forecasting", plain: "Mathematical models over history — time series, regression."},
        {term: "collaborative forecasting", plain: "Partners aligning on one shared view of demand instead of private forecasts."},
        {term: "time series", plain: "A demand history ordered in time, the input to quantitative models."},
        {term: "multiplicative model", plain: "Seasonal factors as proportions of the baseline, so surges scale with growth."},
        {term: "mean absolute deviation", plain: "Average error size regardless of direction, in physical units."},
        {term: "MAPE", plain: "Mean absolute percentage error — error as a percentage, comparable across different volumes. The course uses the acronym alongside MAD and MSE."},
        {term: "bias", plain: "Error with its direction kept; a model can be accurate on average and consistently low."}
      ],
      connects: "Those judge the forecast. The next session smooths it."
    },

    "SCLM-M02-L04": {
      lectureId: "SCLM-M02-L04",
      courseId: "SCLM",
      module: 2,
      order: 4,
      title: "What a forecast is made of",
      objective: "Split observed demand into its systematic and random parts, and name the four components inside the systematic one.",
      explainer: [
        "Forecasting is the core mechanism for matching supply to demand, and it is needed in both system types even though people assume it belongs only to push. In a push system the forecast drives material purchasing and production schedules — everything is made in anticipation. In a pull system, where production waits for real orders, the forecast still determines how much safety stock and capacity buffer to hold, because capacity cannot be conjured the moment an order lands. A pull system does not remove uncertainty; it changes what the forecast is used for.",
        "Observed demand splits into two parts: a systematic component and random variation. The systematic component is the part a model can learn, and it has four elements. Level is the baseline. Trend is growth or decline over time. Seasonality is a predictable cycle with a known period — a festival, a quarter. Cycle is the slower economic wave that has no fixed period.",
        "Random variation is noise, and the goal of a forecasting model is to filter it out rather than to reproduce it. This is what makes the split worth stating as an equation: a model that fits the historical series perfectly has learned the noise as well as the signal, and will forecast worse than a cruder model that only captured the systematic part. Seasonality and cycle are the pair most often confused — seasonality repeats with a known periodicity, cycles do not have one."
      ],
      worked: {
        setup: "A model reproduces last year's demand series almost exactly and performs badly on the next quarter.",
        move: "Recognise it has fitted the random variation as well as the systematic component, and simplify toward level, trend, seasonality and cycle.",
        because: "Observed demand is a systematic component plus random noise, and only the systematic part repeats. A model that matches history perfectly has necessarily learned the noise too, and noise by definition does not recur — so the closer the historical fit, the worse the forward accuracy. Filtering noise out is the model's job, not a failure to fit."
      },
      glossary: [
        {term: "systematic component", plain: "The learnable part of demand: level, trend, seasonality, cycle."},
        {term: "random variation", plain: "Unpredictable noise a model should filter out, not reproduce."},
        {term: "trend", plain: "Growth or decline in the baseline over time."},
        {term: "seasonality", plain: "A predictable cycle with a known period."},
        {term: "cyclical", plain: "Slower economic waves with no fixed periodicity."}
      ],
      connects: "That is what a forecast is made of. The next session covers the methods that estimate it."
    }

  };
})(typeof window === "undefined" ? this : window);
