var headers, rawDataset, classAttributeIndex, distances=new Array(), ranks=new Array(), inputs=new Array();

function csvToArray(str, delimiter = ","){
    headers = str.slice(0,str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    var arr = new Array();
      for(var i=0; i<rows.length; i++)
      {
          var temp = new Array();
          rows[i]=rows[i].split(delimiter);
          rows[i].forEach(value => {
              temp.push(value);
          })
          arr.push(temp);
      }
      return arr; 
}

function displayData(table,header,data)
{
    var row = table.insertRow();
        for(var i=0; i<header.length; i++)
        { 
            var cell=row.insertCell(i);
            cell.innerHTML=header[i];
        }
        for(var i=0; i<data.length; i++)
        {
            var row = table.insertRow();
            for(var j=0; j<data[i].length; j++)
            {
                var cell=row.insertCell(j);
                cell.innerHTML=data[i][j];
            }
        }
}

function getInstance(container)
{
    var br = document.createElement("br");
    var form = document.createElement("form");
    form.setAttribute("class","form-group mx-auto p-3");
    for(var i=0; i<headers.length-1; i++)
    {
        var label = document.createElement("label");
        label.setAttribute("for",headers[i]);
        label.setAttribute("class","col-md-6")
        label.textContent = headers[i];
        var tbox = document.createElement("input");
        tbox.setAttribute("type","text");
        tbox.setAttribute("id",headers[i]);
        tbox.setAttribute("class","col-md-6")
        inputs.push(tbox);
        form.appendChild(label);
        form.appendChild(tbox);
        form.appendChild(br.cloneNode());
    }
    var kLabel = document.createElement("label");
    kLabel.setAttribute("for","k");
    kLabel.setAttribute("class","col-md-6")
    kLabel.textContent = "Value for K";
    var k = document.createElement("input");
    k.setAttribute("type","number");
    k.setAttribute("id","k");
    k.setAttribute("class","col-md-6");
    inputs.push(k);
  
    form.appendChild(kLabel);
    form.appendChild(k);
    form.appendChild(br.cloneNode());
    container.appendChild(form);
}

function calcDistance(query, data)
{
    var sim=0;
    for(var i=0; i<query.length; i++)
    {
        if(query[i]!=data[i])
            sim++;
    }
    return Math.sqrt(sim);
}


function knn(query,k)
{
    for(var i=0; i<rawDataset.length; i++)
        distances.push(calcDistance(query,rawDataset[i]));
    var top = [...distances];
    top=top.sort();
    top=top.slice(0,k);
    var final = new Array();
    var exempt = new Array();
    for(var i=0; i<top.length; i++)
    {
        for(var j=0; j<distances.length; j++)
        {
            if(exempt.indexOf(j)==-1 && top[i]==distances[j])
            {
                final.push(rawDataset[j].concat(distances[j],i+1));
                exempt.push(j);
                break;
            }
        }     
    }
    return final;
}

function displayPrediction(container,result,k)
{
    container.innerHTML="Class Values In Data: </br>";
    var classValues = new Array(), count = new Array(), temp, values=new Array();
    for(var i=0; i<k; i++)
        classValues.push(result[i][classAttributeIndex]);
   classValues.forEach(function(val){
        temp=0;
        if(values.indexOf(val)==-1)
        {
            classValues.forEach(function(cmp){
                if(val==cmp)
                    temp++;
            })
            values.push(val);
            count.push(temp);
            container.innerHTML+=val+" = "+temp+"</br>";
        }   
   })
    var index = count.indexOf(Math.max(count));
    container.innerHTML+="Majority Result = "+values[index];
}

document.getElementById('viewDataPage').addEventListener('click', function(){
    event.preventDefault();
    document.getElementById("addDoc-tab").classList.remove('active');
    document.getElementById("viewData-tab").classList.add('active');
    document.getElementById("addDoc").classList.remove('active');
    document.getElementById("viewData").classList.add('active');

    const input = document.getElementById("documentFile").files[0];
    const reader =  new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        rawDataset = csvToArray(text);
        classAttributeIndex = rawDataset[0].length-1;
    }
    reader.readAsText(input);
})
document.getElementById('preprocessingPage').addEventListener('click', function(){
    event.preventDefault();
    document.getElementById("viewData-tab").classList.remove('active');
    document.getElementById("preprocessing-tab").classList.add('active');
    document.getElementById("viewData").classList.remove('active');
    document.getElementById("preprocessing").classList.add('active');
    // var table = document.getElementById("rawData");
    // displayData(table,headers,rawDataset);
})
document.getElementById('naiiveBayesPage').addEventListener('click', function(){
    event.preventDefault();
    document.getElementById("preprocessing-tab").classList.remove('active');
    document.getElementById("naiiveBayes-tab").classList.add('active');
    document.getElementById("preprocessing").classList.remove('active');
    document.getElementById("naiiveBayes").classList.add('active');
    // var table = document.getElementById("rawData");
    // displayData(table,headers,rawDataset);
})
document.getElementById('knnPage').addEventListener('click', function(){
    event.preventDefault();
    document.getElementById("naiiveBayes-tab").classList.remove('active');
    document.getElementById("knn-tab").classList.add('active');
    document.getElementById("naiiveBayes").classList.remove('active');
    document.getElementById("knn").classList.add('active');

    var doc = document.getElementById("insertData");
    getInstance(doc);

})

document.getElementById('finishPage').addEventListener('click', function(){
    event.preventDefault();
    document.getElementById("knn-tab").classList.remove('active');
    document.getElementById("finish-tab").classList.add('active');
    document.getElementById("knn").classList.remove('active');
    document.getElementById("finish").classList.add('active');
})

document.getElementById("instanceSubmit").addEventListener('click', function(){
    var ans = new Array();
    var temp;
    for(var i=0; i<headers.length-1; i++)
    {
        //var temp = document.getElementById(headers[i]).value;
        temp = inputs[i].value;
        ans.push(temp);
    }
    //alert(ans);
    var k = inputs[headers.length-1].value;
    var result = knn(ans,k);
    var table=document.getElementById("modelTable");
    var header = headers.concat("Distances","Rank");
    displayData(table,header,result);
    
    var display = document.getElementById("results");
    displayPrediction(display,result,k);
})