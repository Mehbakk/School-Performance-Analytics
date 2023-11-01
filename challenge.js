$(document).ready(function () {
    $('.larg div h3').on("click", function () {
        toggleElement($(this));
    });

    $('body').on("click", "nav ul li a", function () {
        updateTitle($(this));
    });
});

const datasetPath = 'School.csv';

d3.csv(datasetPath).then(data => {
    const columnsToRemove = [
        "indigène",
        "préscolaire",
        "Travail",
        "Qualification de la mère",
        "Profession de la mère",
        "Divorcé",
        "Revenu familial",
        "Zone",
        "Nombre d'enseignants",
        "Specialté",
        "Electricité",
        "Eau",
        "pc",
        "Livres",
        "État",
        "Origine",
        "Style d'apprentissage",
        "Satisfaction du cours",
        ""
    ];
    removeColumns(data, columnsToRemove);

    const informationsPersonnelles = processPersonalInfo(data, 39);
    const doughnutData = calculateAgeDistribution(informationsPersonnelles);
    renderDoughnutChart("doughnutChart", doughnutData, "Répartition des Tranches d'Âge des Étudiants");

    const genderCounts = calculateGenderCounts(informationsPersonnelles);
    renderGenderChart("barChart", genderCounts, "Répartition des Étudiants par Sexe");

    const healthProblemsData = calculateHealthProblemsData(informationsPersonnelles);
    renderPieChart("healthProblemsChart", healthProblemsData, "Répartition des Problèmes de Santé chez les Étudiantes");

    const ageWorkData = calculateAgeWorkData(informationsPersonnelles);
    renderStackedBarChart("ageWorkChart", ageWorkData, "Répartition du Travail à la Maison par Âge");

    const genderAverage = calculateGenderBasedAverageScores(data, 39);
    renderBarChart("barChartScores", genderAverage, "Moyenne des Scores par Sexe");


}).catch(error => {
    console.error('Error loading data:', error);
});

function toggleElement(element) {
    var $span = element.find('span');
    var $p = element.next('div');

    $span.toggleClass('entypo-down-open entypo-down-close');
    $p.slideToggle(250);
}

function updateTitle(link) {
    var title = link.data('title');
    $('.title h2').html(title);
}

function removeColumns(data, columnsToRemove) {
    data.forEach(function (d) {
        columnsToRemove.forEach(column => {
            delete d[column];
        });
    });
}

function processPersonalInfo(data, numberOfRowsToMap) {
    const informationsPersonnelles = data
        .slice(0, numberOfRowsToMap)
        .map(d => {
            const ageData = d['Age'];
            if (!ageData || ageData.trim() === '') return null;
            const ageParts = ageData.split('/');
            if (ageParts.length !== 3) return null;

            const [day, month, year] = ageParts;
            const birthDate = new Date(year, month - 1, day);
            const age = calculateAge(birthDate);

            return {
                'Age': age,
                'Sexe': d['Sexe'],
                'problemes_de_sante': d['problèmes de santé'],
                'le_travail_a_la_maison': d['le travail à la maison'],
                'interne_externe': d['interne / externe']
            };
        });

    return informationsPersonnelles;
}

function calculateAgeDistribution(informationsPersonnelles) {
    const doughnutData = [
        { label: "13 ans", value: 0 },
        { label: "14 ans", value: 0 },
        { label: "15 ans", value: 0 },
        { label: "16 ans", value: 0 },
        { label: "17 ans", value: 0 },
        { label: "18 ans", value: 0 },
        { label: "19 ans", value: 0 },
    ];

    informationsPersonnelles.forEach(person => {
        if (person.Age === 13) {
            doughnutData[0].value++;
        } else if (person.Age === 14) {
            doughnutData[1].value++;
        } else if (person.Age === 15) {
            doughnutData[2].value++;
        } else if (person.Age === 16) {
            doughnutData[3].value++;
        } else if (person.Age === 17) {
            doughnutData[4].value++;
        } else if (person.Age === 18) {
            doughnutData[5].value++;
        } else if (person.Age === 19) {
            doughnutData[6].value++;
        } else {
            doughnutData[11].value++;
        }
    });

    return doughnutData;
}

function renderDoughnutChart(chartId, data, title) {
    const chartData = {
        labels: data.map(data => data.label),
        datasets: [
            {
                data: data.map(data => data.value),
                backgroundColor: data.map(() => getRandomColor()),
            },
        ],
    };
    const ctx = document.getElementById(chartId).getContext("2d");

    const doughnutChart = new Chart(ctx, {
        type: "doughnut",
        data: chartData,
        options: {
            title: {
                display: true,
                text: title,
                fontSize: 16,
            },
            legend: {
                display: true,
                position: "right",
            },
        }
    });
}

function calculateGenderCounts(informationsPersonnelles) {
    const genderCounts = informationsPersonnelles.reduce((acc, person) => {
        if (person.Sexe === 'M') {
            acc.Male++;
        } else if (person.Sexe === 'F') {
            acc.Female++;
        }
        return acc;
    }, { Male: 0, Female: 0 });

    return genderCounts;
}

function renderGenderChart(chartId, genderCounts, title) {
    const genderData = [
        { label: "Masculin", mvalue: genderCounts.Male, fvalue: 0 },
        { label: "Féminin", mvalue: 0, fvalue: genderCounts.Female },
    ];

    const chartDataSexe = {
        labels: genderData.map(data => data.label),
        datasets: [
            {
                label: genderData[0].label,
                data: genderData.map(data => data.mvalue),
                backgroundColor: getRandomColor(),
            },
            {
                label: genderData[1].label,
                data: genderData.map(data => data.fvalue),
                backgroundColor: getRandomColor(),
            },
        ],
    };

    const ctxBar = document.getElementById(chartId).getContext("2d");

    const barChart = new Chart(ctxBar, {
        type: "bar",
        data: chartDataSexe,
        options: {
            title: {
                display: true,
                text: title,
                fontSize: 16,
            },
            legend: {
                display: false,
            },
        },
    });
}

function calculateHealthProblemsData(informationsPersonnelles) {
    const healthProblemsData = informationsPersonnelles.reduce((acc, person) => {
        if (person.problemes_de_sante !== 'Non') {
            acc.Oui++;
        } else
            acc.Non++;
        return acc;
    }, { Oui: 0, Non: 0 });

    return healthProblemsData;
}

function renderPieChart(chartId, data, title) {
    const healthProblemsColors = [getRandomColor(), getRandomColor()];

    const chartDataProblemesSante = {
        labels: ["Oui", "Non"],
        datasets: [
            {
                data: [data.Oui, data.Non],
                backgroundColor: healthProblemsColors,
            },
        ],
    };

    const ctxHealthProblems = document.getElementById(chartId).getContext("2d");

    const healthProblemsChart = new Chart(ctxHealthProblems, {
        type: "pie",
        data: chartDataProblemesSante,
        options: {
            title: {
                display: true,
                text: title,
                fontSize: 16,
            },
            legend: {
                display: true,
                position: "right",
            },
        },
    });
}

function calculateAgeWorkData(informationsPersonnelles) {
    const ageWork = {
        13: {
            oui: 0,
            non: 0
        },
        14: {
            oui: 0,
            non: 0
        },
        15: {
            oui: 0,
            non: 0
        },
        16: {
            oui: 0,
            non: 0
        },
        17: {
            oui: 0,
            non: 0
        },
        18: {
            oui: 0,
            non: 0
        },
        19: {
            oui: 0,
            non: 0
        }
    };

    informationsPersonnelles.forEach(person => {
        const age = person.Age;
        const travailMaison = person.le_travail_a_la_maison.toLowerCase();

        if (age >= 13 && age <= 19) {
            if (travailMaison === 'oui' || travailMaison === 'yes') {
                ageWork[age].oui++;
            } else {
                ageWork[age].non++;
            }
        }
    });

    return ageWork;
}

function renderStackedBarChart(chartId, data, title) {
    const students13Years = data[13];
    const students14Years = data[14];
    const students15Years = data[15];
    const students16Years = data[16];
    const students17Years = data[17];
    const students18Years = data[18];
    const students19Years = data[19];

    const ageWorkData = {
        labels: ['13 years', '14 years', '15 years', '16 years', '17 years', '18 years', '19 years'],
        datasets: [
            {
                label: 'Travail à la maison (Oui)',
                data: [students13Years.oui, students14Years.oui, students15Years.oui, students16Years.oui, students17Years.oui, students18Years.oui, students19Years.oui],
                backgroundColor: getRandomColor(),
            },
            {
                label: 'Travail à la maison (Non)',
                data: [students13Years.non, students14Years.non, students15Years.non, students16Years.non, students17Years.non, students18Years.non, students19Years.non],
                backgroundColor: getRandomColor(),
            }
        ]
    };

    const ctxAgeWork = document.getElementById(chartId).getContext('2d');
    const ageWorkChart = new Chart(ctxAgeWork, {
        type: 'bar',
        data: ageWorkData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculateGenderBasedAverageScores(data, numberOfRowsToMap) {
    let sommeScoreArabeMale = 0;
    let sommeScoreArabeFemale = 0;
    let sommeScorePrLangueMale = 0;
    let sommeScorePrLangueFemale = 0;
    let sommeScoreActuelMale = 0;
    let sommeScoreActuelFemale = 0;
    let sommeScoreCollegialMale = 0;
    let sommeScoreCollegialFemale = 0;
    let sommeScorePrimaireMale = 0;
    let sommeScorePrimaireFemale = 0;

    data.slice(0, numberOfRowsToMap).forEach(d => {
        const scoreArabe = d[" score en langue arabe"]
        const scorePrLangue = d[" score en première langue"]
        const scoreActuel = d["Score actuel"]
        const scoreCollegial = d["Score collégial"]
        const scorePrimaire = d["Score primaire"]
        const sexe = d['Sexe']
        if (sexe === 'M') {
            sommeScoreArabeMale += Number(scoreArabe);
            sommeScorePrLangueMale += Number(scorePrLangue);
            sommeScoreActuelMale += Number(scoreActuel);
            sommeScoreCollegialMale += Number(scoreCollegial);
            sommeScorePrimaireMale += Number(scorePrimaire);
        } else if (sexe === 'F') {
            sommeScoreArabeFemale += Number(scoreArabe);
            sommeScorePrLangueFemale += Number(scorePrLangue);
            sommeScoreActuelFemale += Number(scoreActuel);
            sommeScoreCollegialFemale += Number(scoreCollegial);
            sommeScorePrimaireFemale += Number(scorePrimaire);
        }
    });

    const genderCounts = calculateGenderCounts(data.slice(0, numberOfRowsToMap));

    return {
        male: {
            arabe: sommeScoreArabeMale / genderCounts.Male,
            prLangue: sommeScorePrLangueMale / genderCounts.Male,
            actuel: sommeScoreActuelMale / genderCounts.Male,
            collegial: sommeScoreCollegialMale / genderCounts.Male,
            primaire: sommeScorePrimaireMale / genderCounts.Male,
        },
        female: {
            arabe: sommeScoreArabeFemale / genderCounts.Female,
            prLangue: sommeScorePrLangueFemale / genderCounts.Female,
            actuel: sommeScoreActuelFemale / genderCounts.Female,
            collegial: sommeScoreCollegialFemale / genderCounts.Female,
            primaire: sommeScorePrimaireFemale / genderCounts.Female,
        },
    };
}

function renderBarChart(chartId, data, title) {
    const labels = ["Arabe", "Première Langue", "Score Actuel", "Score Collégial", "Score Primaire"];

    const datactxScores = {
        labels: labels,
        datasets: [
            {
                label: "Masculin",
                backgroundColor: getRandomColor(),
                data: [
                    data.male.arabe,
                    data.male.prLangue,
                    data.male.actuel,
                    data.male.collegial,
                    data.male.primaire,
                ]
            },
            {
                label: "Féminin",
                backgroundColor: getRandomColor(),
                data: [
                    data.female.arabe,
                    data.female.prLangue,
                    data.female.actuel,
                    data.female.collegial,
                    data.female.primaire,
                ]
            }
        ]
    };

    const ctxScores = document.getElementById(chartId).getContext('2d');

    const barChartScores = new Chart(ctxScores, {
        type: 'bar',
        data: datactxScores,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function calculateAge(birthDate) {
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}

