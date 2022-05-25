var headers, rawDataset, trainingSet = new Array(), testSet = new Array(), classAttributeIndex;

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

function splitSet(rawSet) {
    var split = ((rawSet.length) * 2) / 3;
    for (var i = 0; i < rawSet.length; i++) {
        if (i < split)
            trainingSet.push(rawSet[i]);
        else
            testSet.push(rawSet[i]);
    }
}

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

function calcDistance(query, data) {
    var sim = 0;
    for (var i = 0; i < query.length; i++) {
        if (query[i] != data[i])
            sim++;
    }
    return Math.sqrt(sim);
}

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
    var index = count.indexOf(Math.max(count));
    return values[index];
}

function knnPredictClass(test, train, k, cIndex) {
    var prediction = new Array(), totDist = new Array();
    for (var i = 0; i < test.length; i++) {
        var dist = new Array();
        for (var j = 0; j < train.length; j++)
            dist.push(calcDistance(test[i], train[j]));
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

function findProbability(train, distinct, cIndex, distinctClass, distinctClassIndex) {
    var values = new Array(), attrCnt = new Array();

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
function findClassProbability(className, train, cIndex) {
    var cnt = 0;
    train.forEach(function (cl) {
        if (cl[cIndex] == className)
            cnt++;
    })

    return (cnt / train.length);
}

function naiveBayesPredictClass(test, train, cIndex) {
    var distinct = distinctize(train);
    var classDistinct = distinct[cIndex];
    //    var countDistinct = new Array();
    //    classDistinct.forEach(function(val){
    //        var cnt = 0;
    //        train.forEach(function(cl){
    //            if(cl[cIndex]==val)
    //             cnt++;
    //        })
    //        countDistinct.push(cnt);
    //    })
    //var values = findProbability(train,distinct,cIndex,classDistinct,0);
    //    alert(values);
    //    alert(findClassProbability(classDistinct[0],train,cIndex));
    //    alert(findClassProbability(classDistinct[1],train,cIndex));
    var prob = new Array(), cProb = new Array();
    for (var i = 0; i < classDistinct.length; i++)
        cProb.push(findClassProbability(classDistinct[i], train, cIndex));
    // alert(cProb);
    for (var i = 0; i < test.length; i++) {
        var res = new Array();
        for (var j = 0; j < classDistinct.length; j++) {
            var p = findProbability(train, distinct, cIndex, classDistinct, j), mul = cProb[j];
            for (var k = 0; k < test[i].length; k++) {
                if(k!=cIndex)
                {
                    var ind = distinct[k].indexOf(test[i][k]);
                    var pr = p[k][ind];
                    mul *= pr;
                }
                
            }
            res.push(mul);
        }
        //alert(res);
        var max = 0;
        for (var x = 1; x < res.length; x++)
        {
            if (res[x] > res[max])
                max = x;
        }    
        prob.push(classDistinct[max]);
        alert(prob);
    }
    
    return prob;
}

document.getElementById('viewDataPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("addDoc-tab").classList.remove('active');
    document.getElementById("viewData-tab").classList.add('active');
    document.getElementById("addDoc").classList.remove('active');
    document.getElementById("viewData").classList.add('active');

    const input = document.getElementById("documentFile").files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        rawDataset = csvToArray(text);
        splitSet(rawDataset);
        classAttributeIndex = rawDataset[0].length - 1;
        // var table = document.getElementById("trainingSet");
        // displayData(table,headers,trainingSet);
        // table = document.getElementById("testSet");
        // displayData(table,headers,testSet);
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
    document.getElementById("naiveBayesAccuracy").innerHTML = "Accuracy = " + accuracy + "%";
})
document.getElementById('knnPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("naiveBayes-tab").classList.remove('active');
    document.getElementById("knn-tab").classList.add('active');
    document.getElementById("naiveBayes").classList.remove('active');
    document.getElementById("knn").classList.add('active');

    // var doc = document.getElementById("insertData");
    // getInstance(doc);
    var knnPrediction = knnPredictClass(testSet, trainingSet, 10, classAttributeIndex);
    var table = document.getElementById("knnPrediction");
    var header = headers.concat("Predicted Class");
    var data = new Array();
    for (var i = 0; i < testSet.length; i++)
        data.push(testSet[i].concat(knnPrediction[i]));
    displayData(table, header, data);
    var accuracy = calcAccuracy(testSet, knnPrediction, classAttributeIndex);
    document.getElementById("knnAccuracy").innerHTML = "Accuracy = " + accuracy + "%";
})

document.getElementById('finishPage').addEventListener('click', function () {
    event.preventDefault();
    document.getElementById("knn-tab").classList.remove('active');
    document.getElementById("finish-tab").classList.add('active');
    document.getElementById("knn").classList.remove('active');
    document.getElementById("finish").classList.add('active');
})