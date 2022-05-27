//global variables that are needed in multiple parts of the program
var headers, rawDataset, trainingSet = new Array(), testSet = new Array(), classAttributeIndex;

//this function converts the accepted csv files into a multidimensional array
function csvToArray(str, delimiter = ",") {
    headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    var arr = new Array();
    for (var i = 0; i < rows.length; i++) {
        var temp = new Array();
        rows[i] = rows[i].split(delimiter);
        rows[i].forEach(value => {
            temp.push(value);
        })
        arr.push(temp);
    }
    return arr;
}

//this function splits the accepted data set into training and test data sets
function splitSet(rawSet, splitRatio) {
    //var split = ((rawSet.length) * 49) / 50;
    for (var i = 0; i < rawSet.length; i++) {
        // if (i < split)
        //     trainingSet.push(rawSet[i]);
        // else
        //     testSet.push(rawSet[i]);
        if (i % splitRatio == 0)
            testSet.push(rawSet[i]);
        else
            trainingSet.push(rawSet[i]);
    }
}

//this function displays given data with header to the specified container
function displayData(table, header, data) {
    var row = table.insertRow();
    for (var i = 0; i < header.length; i++) {
        var cell = row.insertCell(i);
        cell.innerHTML = header[i];
    }
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow();
        for (var j = 0; j < data[i].length; j++) {
            var cell = row.insertCell(j);
            cell.innerHTML = data[i][j];
        }
    }
}

//this function displays confusion matrix for prediction
function displayMatrix(table, matrix) {
    for (var i = 0; i < matrix.length; i++) {
        var row = table.insertRow();
        for (var j = 0; j < matrix[i].length; j++) {
            var cell = row.insertCell(j);
            cell.innerHTML = matrix[i][j];
        }
    }
}

//this function calculates distance between categorical query and an instance in data set
function calcDistance(query, data, cIndex) {
    var sim = 0;
    for (var i = 0; i < query.length; i++) {
        if (i != cIndex) {
            if (query[i] != data[i])
                sim++;
        }
    }
    return Math.sqrt(sim);
}

//this function returns the top k ranked values for the similarity between query and data set
function findTopValues(train, distances, k) {
    var top = [...distances];
    top = top.sort();
    top = top.slice(0, k);
    var final = new Array(), exempt = new Array();
    for (var i = 0; i < top.length; i++) {
        for (var j = 0; j < distances.length; j++) {
            if (exempt.indexOf(j) == -1 && top[i] == distances[j]) {
                final.push(train[j].concat(distances[j], i + 1));
                exempt.push(j);
                break;
            }
        }
    }
    return final;
}

//this function finds the class of the query depending on the majority vote of the class values k similar data sets
function findClass(result, k, cIndex) {
    var classValues = new Array(), count = new Array(), temp, values = new Array();
    for (var i = 0; i < k; i++)
        classValues.push(result[i][cIndex]);
    classValues.forEach(function (val) {
        temp = 0;
        if (values.indexOf(val) == -1) {
            classValues.forEach(function (cmp) {
                if (val == cmp)
                    temp++;
            })
            values.push(val);
            count.push(temp);
        }
    })
    var max = Math.max.apply(Math, count);
    var index = count.indexOf(max);
    return values[index];
}

//this function uses the knn algorithm to predict class of test sets
function knnPredictClass(test, train, k, cIndex) {
    var prediction = new Array(), totDist = new Array();
    for (var i = 0; i < test.length; i++) {
        var dist = new Array();
        for (var j = 0; j < train.length; j++)
            dist.push(calcDistance(test[i], train[j], cIndex));
        totDist.push(dist);
    }
    var topVal, classVal;
    for (var i = 0; i < totDist.length; i++) {
        topVal = findTopValues(train, totDist[i], k);
        classVal = findClass(topVal, k, cIndex);
        prediction.push(classVal);
    }
    return prediction;
}

//this function calculates accuracy of prediction by comparing it with actual class values of attributes
function calcAccuracy(test, prediction, index) {
    var correct = 0, incorrect = 0, accuracy;
    for (var i = 0; i < test.length; i++) {
        if (test[i][index] == prediction[i])
            correct++;
        else
            incorrect++;
    }
    accuracy = (correct / (correct + incorrect)) * 100;
    return accuracy;
}

//this function returns the confusion matrix for given prediction
function calcConfusionMatrix(test, prediction, index) {
    var dist = distinctize(test)[index];
    var matrix = new Array();
    var head = new Array();

    for (var i = 0; i < dist.length; i++) {
        var temp = new Array();
        for (var j = 0; j < dist.length; j++)
            temp.push(parseInt(0));
        matrix.push(temp);
    }
    for (var i = 0; i < dist.length; i++) {
        head.push(dist[i]);
        for (var j = 0; j < test.length; j++) {
            for (var k = 0; k < dist.length; k++) {
                if (test[j][index] == dist[i] && prediction[j] == dist[k]) {
                    matrix[i][k]++;
                    break;
                }
            }
        }
    }

    var confMatrix = new Array();
    for (var i = 0; i < dist.length + 1; i++) {
        var temp = new Array();
        for (var j = 0; j < dist.length + 1; j++)
            temp.push(parseInt(0));
        confMatrix.push(temp);
    }
    for (var i = 0; i < dist.length + 1; i++) {
        for (var j = 0; j < dist.length + 1; j++) {
            if (i == 0 && j == 0)
                confMatrix[i][j] = "-";
            else if (i == 0)
                confMatrix[i][j] = head[j - 1];
            else if (j == 0)
                confMatrix[i][j] = head[i - 1];
            else
                confMatrix[i][j] = matrix[i - 1][j - 1];
        }
    }
    return confMatrix;
}

//this function returns distinct values of all dataset attributes
function distinctize(train) {
    var distinct = new Array();
    for (var i = 0; i < train[0].length; i++) {
        var dist = new Array();
        for (var j = 0; j < train.length; j++) {
            if (dist.indexOf(train[j][i]) == -1)
                dist.push(train[j][i]);

        }
        distinct.push(dist);
    }
    return distinct;
}

//this function calculates the probability of an attribute value having a certain class value
function findProbability(train, distinct, cIndex, distinctClass, distinctClassIndex) {
    var attrCnt = new Array();

    // for(var x=0; x<distinctClass.length; x++)
    // {
    for (var i = 0; i < distinct.length; i++) {
        var attrValCnt = new Array();
        for (var j = 0; j < distinct[i].length; j++) {
            var cnt = 0, cntClass = 0;
            for (var k = 0; k < train.length; k++) {
                if (train[k][cIndex] == distinctClass[distinctClassIndex]) {
                    cntClass++;
                    if (train[k][i] == distinct[i][j])
                        cnt++;
                }

            }
            attrValCnt.push(cnt / cntClass);
        }
        attrCnt.push(attrValCnt);
    }
    //values.push(attrCnt);
    //}
    return attrCnt;
}

//this function calculates the probability of the occurence of a class value in the entire dataset
function findClassProbability(className, train, cIndex) {
    var cnt = 0;
    train.forEach(function (cl) {
        if (cl[cIndex] == className)
            cnt++;
    })
    return (cnt / train.length);
}

//this function uses the naive bayes algorithm to predict class of test data sets
function naiveBayesPredictClass(test, train, cIndex) {
    var distinct = distinctize(train);
    var classDistinct = distinct[cIndex];
    var prob = new Array(), cProb = new Array();
    for (var i = 0; i < classDistinct.length; i++)
        cProb.push(findClassProbability(classDistinct[i], train, cIndex));
    // alert(cProb);
    for (var i = 0; i < test.length; i++) {
        var res = new Array();
        for (var j = 0; j < classDistinct.length; j++) {
            var p = findProbability(train, distinct, cIndex, classDistinct, j), mul = parseInt(1) + parseInt(cProb[j]);
            for (var k = 0; k < test[i].length; k++) {
                if (k != cIndex) {
                    var ind = distinct[k].indexOf(test[i][k]), pr;
                    if (ind == -1)
                        pr = 1;
                    else
                        pr = parseInt(1) + parseFloat(p[k][ind]);
                    mul *= pr;
                }
            }
            res.push(mul);
        }
        var max = 0;
        for (var x = 1; x < res.length; x++) {
            if (res[x] > res[max])
                max = x;
        }
        prob.push(classDistinct[max]);
    }
    //alert(prob);
    return prob;
}

document.getElementById('viewDataPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("addDoc-tab").classList.remove('active');
    document.getElementById("viewData-tab").classList.add('active');
    document.getElementById("addDoc").classList.remove('active');
    document.getElementById("viewData").classList.add('active');

    const input = document.getElementById("dataSet").files[0];
    const splitRatio = parseInt(document.getElementById("splitRatio").value);
    const reader = new FileReader();
    var inputs = new Array();
    reader.onload = function (e) {
        const text = e.target.result;
        //inputs.push(csvToArray(text));
        rawDataset = csvToArray(text);
        splitSet(rawDataset, parseInt(splitRatio));
        classAttributeIndex = rawDataset[0].length - 1;
        var table = document.getElementById("trainingSet");
        var trainCnt = document.getElementById("trainCount");
        trainCnt.innerHTML += trainingSet.length + " instances";
        displayData(table,headers,trainingSet);
        table = document.getElementById("testSet");
        var testCnt = document.getElementById("testCount");
        testCnt.innerHTML += testSet.length + " instances";
        displayData(table,headers,testSet);
    }
    reader.readAsText(input);

})

document.getElementById('naiveBayesPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("viewData-tab").classList.remove('active');
    document.getElementById("naiveBayes-tab").classList.add('active');
    document.getElementById("viewData").classList.remove('active');
    document.getElementById("naiveBayes").classList.add('active');
    var nbPrediction = naiveBayesPredictClass(testSet, trainingSet, classAttributeIndex);
    var table = document.getElementById("naiveBayesPrediction");
    var header = headers.concat("Predicted Class");
    var data = new Array();
    for (var i = 0; i < testSet.length; i++)
        data.push(testSet[i].concat(nbPrediction[i]));
    displayData(table, header, data);
    var accuracy = calcAccuracy(testSet, nbPrediction, classAttributeIndex);
    document.getElementById("naiveBayesAccuracy").innerHTML = "Accuracy = " + accuracy + "% <br> Error Rate = " + (100 - accuracy) + "%";
    var confusionMatrix = calcConfusionMatrix(testSet, nbPrediction, classAttributeIndex);
    var container = document.getElementById("naiveBayesConfusionMatrix");
    displayMatrix(container, confusionMatrix);
})

document.getElementById('knnPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("naiveBayes-tab").classList.remove('active');
    document.getElementById("knn-tab").classList.add('active');
    document.getElementById("naiveBayes").classList.remove('active');
    document.getElementById("knn").classList.add('active');

    var k = parseInt(Math.sqrt(trainingSet.length));
    var knnPrediction = knnPredictClass(testSet, trainingSet, k, classAttributeIndex);
    var kVal = document.getElementById("kValue");
    kVal.innerHTML = "Value for K = Square root of " + trainingSet.length + " = " + k + "<br>";
    var table = document.getElementById("knnPrediction");
    var header = headers.concat("Predicted Class");
    var data = new Array();
    for (var i = 0; i < testSet.length; i++)
        data.push(testSet[i].concat(knnPrediction[i]));
    displayData(table, header, data);
    var accuracy = calcAccuracy(testSet, knnPrediction, classAttributeIndex);
    document.getElementById("knnAccuracy").innerHTML = "Accuracy = " + accuracy + "% <br> Error Rate = " + (100 - accuracy) + "%";
    var confusionMatrix = calcConfusionMatrix(testSet, knnPrediction, classAttributeIndex);
    var container = document.getElementById("knnConfusionMatrix");
    displayMatrix(container, confusionMatrix);
})

document.getElementById('finishPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("knn-tab").classList.remove('active');
    document.getElementById("finish-tab").classList.add('active');
    document.getElementById("knn").classList.remove('active');
    document.getElementById("finish").classList.add('active');
})