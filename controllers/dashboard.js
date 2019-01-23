const db = require('../db');
const mysql = require('mysql');

exports.getDashboard = async (req, res) => {
  const { id } = req.user;

  try {
    const result = {};

    // HOST: get dates and experience id
    let prepared = `SELECT d.id AS date_id, 
                    d.date, 
                    CONCAT(e.activity, " with a ", e.occupation) AS title,
                    e.id AS experience_id
                    FROM dates AS d
                    LEFT JOIN experiences AS e
                    ON d.experience_id = e.id
                    WHERE e.host_id = ?
                    AND d.guests > 0
                    ORDER BY d.date ASC`;
    const inserts = [id];
    let query = mysql.format(prepared, inserts);
    result.host.dates = await db.query(query);

    // HOST: get history
    prepared =  `SELECT er.price * COUNT(d.date) AS earnings,
                  er.average_rating,
                  er.total_ratings
                  FROM ( 
                  SELECT e.*, 
                  AVG(r.rating) AS average_rating,
                  COUNT(r.rating) AS total_ratings,
                  r.date
                  FROM experiences as e
                  LEFT JOIN reviews as r
                  ON e.id = r.experience_id
                  GROUP BY e.id) AS er
                  LEFT JOIN dates as d
                  on er.id = d.experience_id
                  WHERE er.host_id = ?
                  AND d.date < NOW()
                  AND er.date < NOW()`;
    query = mysql.format(prepared, inserts);
    result.host.history = await db.query(query);

    // USER: get dates and experience id
    prepared = `SELECT d.id AS date_id, 
                    d.date, 
                    d.guests,
                    e.id AS experience_id,
                    CONCAT(e.activity, " with a ", e.occupation) AS title
                    FROM dates AS d
                    LEFT JOIN experiences AS e
                    ON d.experience_id = e.id
                    WHERE d.user_id = ?
                    ORDER BY d.date ASC`;
    query = mysql.format(prepared, inserts);
    result.user.dates = await db.query(query);

    res.send({
      success: true,
      result,
    })
  } catch (err) {
    console.log(err)
    res.status(422).send('Error getting dashboard');
  }
};