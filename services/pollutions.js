const connection = require("../models/db.js");
const objectsService = require("./objects");
const pollutantsService = require("./pollutants");


module.exports.selectAll = async () => {
    const [rows] = await connection.query(`
    SELECT 
        pollution.pollution_id, 
        object.object_name, 
        pollutant.pollutant_name, 
        pollution.pollution_year, 
        pollution.pollution_concentration,
        pollution.daily_gdk,
        pollution.gas_dust_flow,
        pollution.pollution_value 
    FROM pollution 
    INNER JOIN object ON pollution.object_id = object.object_id 
    INNER JOIN pollutant ON pollution.pollutant_id = pollutant.pollutant_id 
    ORDER BY pollution_id;
  `);
    return rows;
};

module.exports.insertOne = async (pollution) => {
    const objectId = await objectsService.getIdByName(pollution.object_name);
    const pollutantId = await pollutantsService.getIdByName(pollution.pollutant_name);

    await connection.query(
        "INSERT INTO pollution (object_id, pollutant_id, pollution_year, pollution_concentration, daily_gdk, gas_dust_flow, pollution_value) VALUES (?, ?, ?, ?, ?, ?, ?);",
        [objectId, pollutantId, pollution.pollution_year, pollution.pollution_concentration, pollution.daily_gdk, pollution.gas_dust_flow, pollution.pollution_value]
    );
};

module.exports.insertFromExcel = async (rows) => {
    await connection.query("INSERT INTO pollution (object_id, pollutant_id, pollution_year, pollution_concentration, daily_gdk, gas_dust_flow, pollution_value) VALUES ?;", [rows]);
};

module.exports.updateById = async (id, pollution) => {
    const objectId = await objectsService.getIdByName(pollution.object_name);
    const pollutantId = await pollutantsService.getIdByName(pollution.pollutant_name);

    const result = await connection.query(
        "UPDATE pollution SET  object_id = ?, pollutant_id = ?, pollution_year = ?, pollution_concentration = ?, daily_gdk = ?, gas_dust_flow = ?, pollution_value = ? WHERE pollution_id = ?;",
        [objectId, pollutantId, pollution.pollution_year, pollution.pollution_concentration, pollution.daily_gdk, pollution.gas_dust_flow, pollution.pollution_value, id]
    );
    return result[0].affectedRows;
};

module.exports.deleteById = async (id) => {
    const result = await connection.query("DELETE FROM pollution WHERE pollution_id = ?;", [id]);
    return result[0].affectedRows;
};

module.exports.getById = async (id) => {
    const [row] = await connection.query(
        `
  SELECT 
      pollution.pollution_id, 
      object.object_name, 
      pollutant.pollutant_name, 
      pollution.pollution_year, 
      pollution.pollution_concentration,
      pollution.daily_gdk,
      pollution.gas_dust_flow,
      pollution.pollution_value 
  FROM pollution 
  INNER JOIN object ON pollution.object_id = object.object_id 
  INNER JOIN pollutant ON pollution.pollutant_id = pollutant.pollutant_id 
  WHERE pollution_id = ?;
`, [id]);

    return row[0];
};

module.exports.selectObjectNames = async () => {
    const [rows] = await connection.query("SELECT object_name FROM object;");
    return rows;
};

module.exports.selectPollutantNames = async () => {
    const [rows] = await connection.query("SELECT pollutant_name FROM pollutant;");
    return rows;
};

module.exports.calculateRisks = async () => {
    const [ids] = await connection.query("SELECT pollution_id FROM pollution;");
    const result = [];

    for (let idObj of ids) {
        const id = idObj.pollution_id;
        let cancerRisk = await calcCr(id);
        let nonCancerRisk = await calcHq(id);
        nonCancerRisk = Math.round(nonCancerRisk * 10000000) / 10000000;
        cancerRisk = Math.round(cancerRisk * 10000000) / 10000000;

        const nonCancerRiskGrade = await nonCancerEvaluation(nonCancerRisk);
        const cancerRiskGrade = await cancerEvaluation(cancerRisk);

        result.push({ id, nonCancerRisk, cancerRisk, nonCancerRiskGrade, cancerRiskGrade });
    }

    return result;
};

const calcCr = async (id) => {
    const [[{ pollution_concentration: ca }]] = await connection.query("SELECT pollution_concentration FROM pollution WHERE pollution_id = ?;", [id]);
    const [[{ sf }]] = await connection.query("SELECT sf FROM pollutant WHERE pollutant_id = (SELECT pollutant_id FROM pollution WHERE pollution_id = ?);", [id]);

    const result = await calcAddLadd(ca) * sf;
    return result;
};

const calcHq = async (id) => {
    const [[{ pollution_concentration: ca }]] = await connection.query("SELECT pollution_concentration FROM pollution WHERE pollution_id = ?;", [id]);
    const [[{ rfc }]] = await connection.query("SELECT rfc FROM pollutant WHERE pollutant_id = (SELECT pollutant_id FROM pollution WHERE pollution_id = ?);", [id]);

    const result = ca / rfc;
    return result;
};

const calcAddLadd = async (ca) => {
    const
        daysInYear = 365,
        defaultTout = 8,
        defaultTin = 16,
        defaultVout = 1.4,
        defaultVin = 0.63,
        defaultEF = 350,
        defaultED = 30,
        defaultBW = 70,
        defaultAT = 70;

    return (((ca * defaultTout * defaultVout) + (ca * defaultTin * defaultVin)) * defaultEF * defaultED) / (defaultBW * defaultAT * daysInYear);
};

const nonCancerEvaluation = async (riskValue) => {
    if (riskValue < 1) {
        return {
            name: 'low-nonCancer-risk',
            description: 'Ризик виникнення шкідливих ефектів розглядають як зневажливо малий'
        };
    } else if (riskValue === 1) {
        return {
            name: 'medium-nonCancer-risk',
            description: 'Гранична величина, що не потребує термінових заходів, однак не може розглядатися як досить прийнятна'
        };
    } else {
        return {
            name: 'high-nonCancer-risk',
            description: 'Імовірність розвитку шкідливих ефектів зростає пропорційно збільшенню HQ'
        };
    }
};

const cancerEvaluation = async (riskValue) => {
    if (riskValue > 1e-3) {
        return {
            name: 'high-cancer-risk',
            description: 'Високий (De Manifestis) - не прийнятний для виробничих умов і населення. Необхідне здійснення заходів з усунення або зниження ризику'
        };
    } else if (riskValue < 1e-3 && riskValue > 1e-4) {
        return {
            name: 'medium-cancer-risk',
            description: 'Середній - припустимий для виробничих умов; за впливу на все населення необхідний динамічний контроль і поглиблене вивчення джерел і можливих наслідків шкідливих впливів для вирішення питання про заходи з управління ризиком'
        };
    }
    else if (riskValue < 1e-4 && riskValue > 1e-6) {
        return {
            name: 'low-cancer-risk',
            description: 'Низький - припустимий ризик (рівень, на якому, як правило, встановлюються гігієнічні нормативи для населення)'
        };
    } else {
        return {
            name: 'min-cancer-risk',
            description: 'Мінімальний (De Minimis) - бажана (цільова) величина ризику при проведенні оздоровчих і природоохоронних заходів'
        };
    }
};

module.exports.calculateLoss = async () => {
    const [ids] = await connection.query("SELECT pollution_id FROM pollution;");
    const result = [];

    for (let idObj of ids) {
        const id = idObj.pollution_id;
        let loss = await calcAirPenalty(id);
        loss = loss.toFixed(2)
        result.push({ id, loss });
    }

    return result;
};

const calcAirPenalty = async (id) => {
    const
        defaultMinWage = 6700,
        defaultT = 8760;


    const [[{ k_nas: knas }]] = await connection.query("SELECT k_nas FROM object WHERE object_id = (SELECT object_id FROM pollution WHERE pollution_id = ?);", [id]);
    const [[{ k_f: kf }]] = await connection.query("SELECT k_f FROM object WHERE object_id = (SELECT object_id FROM pollution WHERE pollution_id = ?);", [id]);
    const [[{ pollution_concentration: concentration }]] = await connection.query("SELECT pollution_concentration FROM pollution WHERE pollution_id = ?;", [id]);
    const [[{ daily_gdk: gdkDaily }]] = await connection.query("SELECT daily_gdk FROM pollution WHERE pollution_id = ?;", [id]);
    const [[{ gas_dust_flow: qv }]] = await connection.query("SELECT gas_dust_flow FROM pollution WHERE pollution_id = ?;", [id]);

    const kT = knas * kf;
    const kZi = concentration / gdkDaily;
    if (concentration <= gdkDaily) return 0;
    else if (gdkDaily > 1)
        return await calcPollutionMass(concentration, gdkDaily, qv, defaultT) * 1.1 * defaultMinWage * (10 / gdkDaily) * kT * kZi;
    else
        return await calcPollutionMass(concentration, gdkDaily, qv, defaultT) * 1.1 * defaultMinWage * (1 / gdkDaily) * kT * kZi;
};

const calcPollutionMass = async (po, poNorm, qv, t) => {
    return 3.6 * Math.pow(10, -6) * (po - poNorm) * qv * t;
};