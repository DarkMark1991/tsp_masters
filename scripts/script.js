/**
 * Created by DARKMARK on 6/28/2015.
 */

    //~~~~~~ Drawing Functions ~~~~~~~//
function drawNoteLines(){
    tspContext.fillStyle = "#FFFFE0";
    tspContext.fillRect(0, 0, tspCanvas.width, tspCanvas.height);
    for (var x = 0.5; x < tspCanvas.width; x += 10) {
        tspContext.moveTo(x, 0);
        tspContext.lineTo(x, tspCanvas.height);
    }
    for (var y = 0.5; y < tspCanvas.height; y += 10) {
        tspContext.moveTo(0, y);
        tspContext.lineTo(tspCanvas.width, y);
    }
    tspContext.strokeStyle = "#eee";
    tspContext.stroke();
}

function drawCities(cityArray){
    tspContext.fillStyle = "#000000";
    for(var i=0; i<cityArray.length; i++){
        tspContext.fillRect(cityArray[i].x-2, cityArray[i].y-2, 5, 5);
    }
}

function drawEdge(a, b, isSame) {
    tspContext.beginPath();
    tspContext.moveTo(a.x, a.y);
    tspContext.lineTo(b.x, b.y);
    if(isSame) tspContext.strokeStyle = "#6633FF";
    else tspContext.strokeStyle = "#D80000";
    tspContext.stroke();
}

function drawPath(cityArray, path, prevPath) {
    for(var i=0; i<path.length; i+=8){
        if(i+8>=path.length)
            drawEdge(cityArray[parseInt(path.substr(i, 8), 2)], cityArray[parseInt(path.substr(0, 8), 2)], path.substr(i,8)+path.substr(0,8)==prevPath.substr(i,8)+prevPath.substr(0,8));
        else{
            drawEdge(cityArray[parseInt(path.substr(i,8), 2)], cityArray[parseInt(path.substr(i+8,8), 2)], path.substr(i,8)+path.substr(i+8,8)==prevPath.substr(i,8)+prevPath.substr(i+8,8));
        }
    }
}

//        function displayOnCanvas() {
//            drawNoteLines();
//            var i;
//            tspContext.fillStyle = "#000000";
//            for(i=0; i<tspPopulation.cities.length; i++){
//                tspContext.fillRect(tspPopulation.cities[i].x-2, tspPopulation.cities[i].y-2, 5, 5);
//            }
//            for(i=0; i<tspPopulation.paths[0].length; i+=8){
//                if(i+8>=tspPopulation.paths[0].length)
//                    drawEdge(tspPopulation.cities[parseInt(tspPopulation.paths[0].substr(i, 8), 2)], tspPopulation.cities[parseInt(tspPopulation.paths[0].substr(0, 8), 2)], tspPopulation.paths[0].substr(i,8)+tspPopulation.paths[0].substr(0,8)==tspPopulation.prevPaths[0].substr(i,8)+tspPopulation.prevPaths[0].substr(0,8));
//                else{
//                    drawEdge(tspPopulation.cities[parseInt(tspPopulation.paths[0].substr(i,8), 2)], tspPopulation.cities[parseInt(tspPopulation.paths[0].substr(i+8,8), 2)], tspPopulation.paths[0].substr(i,8)+tspPopulation.paths[0].substr(i+8,8)==tspPopulation.prevPaths[0].substr(i,8)+tspPopulation.prevPaths[0].substr(i+8,8));
//                }
//            }
//            tspFlags.drawPath = 1;
////            alert(tspPopulation.paths[0].path +"\n"+ tspPopulation.prevPaths[0].path);
//        }

function displayOnCanvas() {
    drawNoteLines();
    drawCities(tspPopulation.cities);
    drawPath(tspPopulation.cities, tspPopulation.paths[0].path, tspPopulation.prevPaths[0].path);
    tspFlags.drawPath = 1;
//            alert(tspPopulation.paths[0].path +"\n"+ tspPopulation.prevPaths[0].path);
}

//~~~~~~ TSP Functions ~~~~~~~//
function generateCities(cityNum) {
    var cityArray = [];
    for(i=0; i<cityNum; i++){
        cityArray[i] = { bin: ("0000000" + i.toString(2)).slice(-8), x:Math.floor(Math.random() * (800)), y:Math.floor(Math.random() * (800))};
    }
    return cityArray;
}

function calculateDistance(a,b) {
    var abx = a.x - b.x;
    var aby = a.y - b.y;
    return Math.floor(Math.sqrt(abx*abx + aby*aby));
}

function mapDistances(cityArray) {
    var distances = [];
    for(var i=0; i<cityArray.length; i++) {
        distances[i] = [];
        for (var j = i; j < cityArray.length; j++) {
//                    alert(i + " " + j);
            distances[i][j] = calculateDistance(cityArray[i], cityArray[j])
        }
    }

    for(i=0; i<cityArray.length; i++)
        for (j = i + 1; j < cityArray.length; j++)
            distances[j][i] = distances[i][j];

    return distances;
}

function generateRandomPaths(cityNum, popSize, distances) {
    var paths = [];
    var sumDistance = 0;
    for(var p=0; p<popSize; p++) {
        var randIndexes = [];
        var path = "";
        var distance = 0;
        var longestEdge = 0;
        for (var i = 0; i < cityNum; i++) {
            var j = "start";
            while (randIndexes.indexOf(j) != -1 || j === "start")
                j = Math.floor(Math.random() * (cityNum));
            randIndexes[i] = j;
            path += ("0000000" + randIndexes[i].toString(2)).slice(-8);

            if(i===0) distance += 0;
            else {
                distance += distances[randIndexes[i-1]][randIndexes[i]];
                longestEdge = distances[randIndexes[i-1]][randIndexes[i]]>longestEdge?distances[randIndexes[i-1]][randIndexes[i]]:longestEdge;
            }
        }
        distance += distances[randIndexes[cityNum-1]][randIndexes[0]];
        longestEdge = distances[randIndexes[cityNum-1]][randIndexes[0]]>longestEdge?distances[randIndexes[cityNum-1]][randIndexes[0]]:longestEdge;
        sumDistance += distance;
        paths[p] = {path:  path, dist: distance, longestEdge:longestEdge};
    }
    paths = paths.sort(function(a, b) {
        return a.dist - b.dist;
    });
    tspPopulation.meanDistance = Math.floor(sumDistance/popSize);
    return paths;
}

//        function evalDistance(path){
//            var distance = 0;
//            for(var i=0; i<path.length; i+=8){
//                if(i+8>=path.length)
//                    distance += tspPopulation.distances[parseInt(path.substr(i, 8), 2)][parseInt(path.substr(0, 8), 2)];
//                else
//                    distance += tspPopulation.distances[parseInt(path.substr(i,8), 2)][parseInt(path.substr(i+8,8), 2)];
//            }
//            return distance;
//        }

function displayStats() {
    $("#generationNum").val(tspPopulation.genNum);
    $("#bestDistance").val(tspPopulation.paths[0].dist);
    $("#worstDistance").val(tspPopulation.paths[tspPopulation.popSize-1].dist);
    $("#meanDistance").val(tspPopulation.meanDistance);
    tspFlags.displayStats = 1;
}

function timer(state) {
    if(state === "start") {
//                tspFlags.timerInterval = setInterval(function(){ $("#elapsedTime").val(tspPopulation.timer++); }, 1);

        tspFlags.timerInterval = setInterval(function(){
            tspPopulation.timer = (new Date).getTime()-tspFlags.startTime;
            $("#elapsedTime").val(tspPopulation.timer);
        }, 1);

    }
    if(state === "stop") {
        clearInterval(tspFlags.timerInterval);
    }
}

function initialize() {

    tspContext.clearRect(0, 0, tspCanvas.width, tspCanvas.height);
    tspPopulation.cityNum = $("#cityNum").val();
    tspPopulation.popSize = $("#popSize").val();
    tspPopulation.maxGen = $("#maxGen").val();
    tspPopulation.convergance = $("#converge").val();
    tspPopulation.genNum = 0;
    tspPopulation.timer = 0;
    $("#elapsedTime").val(tspPopulation.timer);
    tspPopulation.eliteRate = $("#eliteRate").val();
    tspPopulation.mutationRate = $("#mutationRate").val();
    tspPopulation.crossoverOperator = $("#crossoverOperator").val();
    tspPopulation.mutationOperator = $("#mutationOperator").val();
    tspPopulation.cities = generateCities(tspPopulation.cityNum);
    tspPopulation.distances = mapDistances(tspPopulation.cities);
    tspPopulation.paths = generateRandomPaths(tspPopulation.cityNum, tspPopulation.popSize, tspPopulation.distances);
    //console.log(tspPopulation.paths);
    tspPopulation.prevPaths = tspPopulation.paths.slice();
    tspPopulation.originalPaths = tspPopulation.paths.slice();
    tspPopulation.countSame = 0;
    //tspPopulation.genIterator = [];
    //for(var i=0; i<tspPopulation.maxGen; i++) tspPopulation.genIterator[i]=i;
    window.requestAnimationFrame(displayOnCanvas);
    displayStats();
}

function reset() {
    tspPopulation.paths = tspPopulation.originalPaths.slice();
    tspPopulation.prevPaths = tspPopulation.paths;
    tspPopulation.eliteRate = $("#eliteRate").val();
    tspPopulation.mutationRate = $("#mutationRate").val();
    tspPopulation.crossoverOperator = $("#crossoverOperator").val();
    tspPopulation.mutationOperator = $("#mutationOperator").val();
    tspPopulation.genNum = 0;
    tspPopulation.timer = 0;

    tspPopulation.countSame = 0;
    //console.log(tspPopulation.paths);

    //console.log(tspPopulation.originalPaths);
    window.requestAnimationFrame(displayOnCanvas);
    displayStats();
}

function reverse(s) {
    var o = '';
    for (var i = s.length - 1; i >= 0; i--)
        o += s[i];
    return o;
}

function elitize() {
    //tspPopulation.eliteSize = Math.floor((tspPopulation.popSize*tspPopulation.eliteRate)/100);
    tspPopulation.eliteSize = tspPopulation.eliteRate;
    if(tspPopulation.eliteSize%2==0) tspPopulation.eliteSize++;
    tspFlags.elitize = 1;
//            setTimeout(function(){tspFlags.elitize = 1}, 2000)
}

function mutate(pathArray, longestEdge) {
    var i, j, path, start, end, insertPoint, switchPoint, switchPoint2, inversePoint, inversePoint2, tmp, substr, calcMutationRate, rand, rand2;
    switch(tspPopulation.mutationOperator){
        case "DM":
            if(Math.random() * 100 < tspPopulation.mutationRate) {
                path = pathArray.join('');
                start = Math.floor(Math.random() * (tspPopulation.cityNum - 3));
                end = Math.floor(Math.random() * (tspPopulation.cityNum - start + 1)) + start - 1;
                substr = path.substring(start, end);
                path = path.replace(substr, '');
                insertPoint = Math.floor(Math.random() * (path.length / 8 - 2)) + 1;

                //console.log("DM", start, end, insertPoint);
                path = path.substring(0, insertPoint * 8) + substr + path.substring(insertPoint * 8);
            }
            else path = pathArray.join('');
            break;

        case "TWORS":
            path = pathArray.join('');
            rand = Math.random() * 100;
            if (rand < tspPopulation.mutationRate) {
                switchPoint = Math.floor(Math.random() * (tspPopulation.cityNum));
                switchPoint2 = Math.floor(Math.random() * (tspPopulation.cityNum));
                tmp = pathArray[switchPoint];
                pathArray[switchPoint] = pathArray[switchPoint2];
                pathArray[switchPoint2] = tmp;
                path = pathArray.join('');
            }
            break;

        case "TWORS3":
            for(i=0; i<tspPopulation.popSize; i++) {
                if (Math.random() * 100 < tspPopulation.mutationRate) {
                    switchPoint = Math.floor(Math.random() * (tspPopulation.cityNum));
                    tmp = pathArray[switchPoint];
                    pathArray[switchPoint] = pathArray[i];
                    pathArray[i] = tmp;
                    //console.log("DM", switchPoint);

                }
            }
            path = pathArray.join('');
            break;

        case "TWORS2":
            for(i=0; i<tspPopulation.popSize; i++) {
                if (Math.random() * 100 < tspPopulation.mutationRate) {
                    switchPoint = Math.floor(Math.random() * (tspPopulation.cityNum));
                    tmp = pathArray[switchPoint];
                    pathArray[switchPoint] = pathArray[i];
                    pathArray[i] = tmp;
                    //console.log("DM", switchPoint);
                    break;
                }
            }
            path = pathArray.join('');
            break;

        case "CIM":
            path = pathArray.join('');
            //console.log(path);
            rand = Math.random() * 100;
            if (rand < tspPopulation.mutationRate) {
            //for(i=0; i<tspPopulation.cityNum; i++) {
                tmp = '';
            //    if (Math.random() * 100 < tspPopulation.mutationRate) {
            //        //inversePoint = Math.floor(Math.random() * (tspPopulation.cityNum-i-2)+i);
            //        inversePoint = i;
                inversePoint = Math.floor(Math.random() * (tspPopulation.cityNum));
                    //path = reverse(path.substring(0, inversePoint*8)) + reverse(path.substring(inversePoint*8));
                    for(j=inversePoint; j>=0; j--)
                        tmp += pathArray[j];
                    for(j=tspPopulation.cityNum-1; j>inversePoint; j--)
                        tmp += pathArray[j];
                    path = tmp;
                //console.log(inversePoint,path);
                    //console.log(pathArray.length, inversePoint, tmp);
                }
            //}
            break;

        case "CIM2":
            //console.log(pathArray);
            path = pathArray.join('');
            //console.log(path);
            for(i=0; i<tspPopulation.cityNum; i++) {
                tmp = '';
                if (Math.random() * 100 < tspPopulation.mutationRate) {
                    //inversePoint = Math.floor(Math.random() * (tspPopulation.cityNum-i-2)+i);
                    inversePoint = i;
                    //path = reverse(path.substring(0, inversePoint*8)) + reverse(path.substring(inversePoint*8));
                    for(j=inversePoint; j>=0; j--)
                        tmp += pathArray[j];
                    for(j=tspPopulation.cityNum-1; j>inversePoint; j--)
                        tmp += pathArray[j];
                    path = tmp;
                    //console.log(pathArray.length, inversePoint, tmp);
                    //break;
                }
            }
            break;

        case "RSM":
            path = pathArray.join('');
            rand = Math.random() * 100;
            if (rand < tspPopulation.mutationRate) {
                inversePoint = Math.floor(Math.random() * (tspPopulation.cityNum));
                inversePoint2 = Math.floor(Math.random() * (tspPopulation.cityNum - inversePoint - 1)) + inversePoint + 1;
                tmp = '';
                for (j = 0; j < inversePoint; j++)
                    tmp += pathArray[j];
                for (j = inversePoint2 - 1; j >= inversePoint; j--)
                    tmp += pathArray[j];
                for (j = inversePoint2; j < tspPopulation.cityNum; j++)
                    tmp += pathArray[j];
                path = tmp;
            }
            break;

        case "CTWORS":
            //if(Math.random() * 100 < tspPopulation.mutationRate) {
                switchPoint = [];
                for (i = 1; i < tspPopulation.cityNum; i++) {
                    //console.log(pathArray, i);
                    //console.log(parseInt(pathArray[i-1],2), parseInt(pathArray[i],2), tspPopulation.distances[parseInt(pathArray[i-1],2)][parseInt(pathArray[i],2)], tspPopulation.paths[i].longestEdge);
                    calcMutationRate = (tspPopulation.distances[parseInt(pathArray[i - 1], 2)][parseInt(pathArray[i], 2)] / longestEdge) * 100;
                    calcMutationRate = (calcMutationRate > 10) ? calcMutationRate : 10;
                    rand = Math.random() * 100;
                    if (rand < calcMutationRate) {
                        switchPoint.push(i);
                        //console.log(i, rand, "<", calcMutationRate, "=", rand < calcMutationRate, tspPopulation.distances[parseInt(pathArray[i-1],2)][parseInt(pathArray[i],2)], longestEdge);
                        //tmp = pathArray[switchPoint];
                        //pathArray[switchPoint] = pathArray[i];
                        //pathArray[i] = tmp;
                        ////console.log("DM", switchPoint);
                        //
                        //break;
                    }
                }
                if (switchPoint.length > 1) {
                    //for (i = 1; i < switchPoint.length; i++) {
                    rand = Math.floor(Math.random() * (switchPoint.length - 1));
                    rand2 = Math.floor(Math.random() * (switchPoint.length - (rand + 1)) + (rand + 1));
                    tmp = pathArray[switchPoint[rand]];
                    pathArray[switchPoint[rand]] = pathArray[switchPoint[rand2-1]];
                    pathArray[switchPoint[rand2-1]] = tmp;
                    //}
                }
            //}
            path = pathArray.join('');
            break;

        case "CCIM":
            path = pathArray.join('');
            //if(Math.random() * 100 < tspPopulation.mutationRate) {

                inversePoint = [];
                inversePoint[0] = 0;
                for (i = 1; i < tspPopulation.cityNum; i++) {
                    calcMutationRate = (tspPopulation.distances[parseInt(pathArray[i - 1], 2)][parseInt(pathArray[i], 2)] / longestEdge) * 100;
                    calcMutationRate = (calcMutationRate > 10) ? calcMutationRate : 10;
                    rand = Math.random() * 100;
                    if (rand < calcMutationRate) {
                        inversePoint.push(i);
                    }
                    //console.log(pathArray, i);
                    //console.log(parseInt(pathArray[i-1],2), parseInt(pathArray[i],2), tspPopulation.distances[parseInt(pathArray[i-1],2)][parseInt(pathArray[i],2)], tspPopulation.paths[i].longestEdge);
                    //console.log(inversePoint);
                    //inversePoint = tspPopulation.distances[parseInt(pathArray[inversePoint-1],2)][parseInt(pathArray[inversePoint],2)]>tspPopulation.distances[parseInt(pathArray[i-1],2)][parseInt(pathArray[i],2)]?inversePoint:i;
                }
                rand = Math.floor(Math.random() * inversePoint.length);
                //console.log(inversePoint[rand], rand);
                tmp = '';
                for (j = inversePoint[rand]; j >= 0; j--)
                    tmp += pathArray[j];
                for (j = tspPopulation.cityNum - 1; j > inversePoint[rand]; j--)
                    tmp += pathArray[j];
                path = tmp;
            //}
            break;

        case "CRSM":
            path = pathArray.join('');
            //if(Math.random() * 100 < tspPopulation.mutationRate) {
                inversePoint = [];
                inversePoint[0] = 0;
                for (i = 1; i < tspPopulation.cityNum; i++) {
                    calcMutationRate = (tspPopulation.distances[parseInt(pathArray[i - 1], 2)][parseInt(pathArray[i], 2)] / longestEdge) * 100;
                    calcMutationRate = (calcMutationRate > 10) ? calcMutationRate : 10;
                    rand = Math.random() * 100;
                    if (rand < calcMutationRate) {
                        inversePoint.push(i);
                    }
                    //console.log(pathArray, i);
                    //console.log(parseInt(pathArray[i-1],2), parseInt(pathArray[i],2), tspPopulation.distances[parseInt(pathArray[i-1],2)][parseInt(pathArray[i],2)], tspPopulation.paths[i].longestEdge);
                    //console.log(inversePoint);
                    //inversePoint = tspPopulation.distances[parseInt(pathArray[inversePoint-1],2)][parseInt(pathArray[inversePoint],2)]>tspPopulation.distances[parseInt(pathArray[i-1],2)][parseInt(pathArray[i],2)]?inversePoint:i;
                }


                if (inversePoint.length >= 2) {
                    inversePoint.sort(function (a, b) {
                        return a - b;
                    });
                    rand = Math.floor(Math.random() * (inversePoint.length - 1));
                    rand2 = Math.floor(Math.random() * (inversePoint.length - (rand + 1)) + (rand + 1));
                    //console.log("in", inversePoint);
                    //console.log(rand, rand2, inversePoint[rand], inversePoint[rand2]);
                    tmp = '';
                    for (j = 0; j < inversePoint[rand]; j++)
                        tmp += pathArray[j];
                    for (j = inversePoint[rand2] - 1; j >= inversePoint[rand]; j--)
                        tmp += pathArray[j];
                    for (j = inversePoint[rand2]; j < tspPopulation.cityNum; j++)
                        tmp += pathArray[j];
                    path = tmp;
                }
            //}
            break;
    }



    //tspFlags.mutate = 1;
    return path;
}

function crossover() {
    var newPaths = [];
    var sumDistance = 0;
    var report = "" ;
    var i, j, k, n1, n2, rand, start, end;
    var child, parent, slice;

    switch(tspPopulation.crossoverOperator){
        case "test":
            //if(tspPopulation.eliteSize%2==0) tspPopulation.eliteSize++;
            for(i=tspPopulation.eliteSize; i<tspPopulation.popSize; i+=2){
                n1 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
                n2 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
                var crossover = Math.floor(Math.random() * tspPopulation.cityNum)*8;

                tspPopulation.paths[i].path = tspPopulation.prevPaths[n1].path.substring(0, crossover) + tspPopulation.prevPaths[n2].path.substring(crossover, tspPopulation.cityNum*8);
                tspPopulation.paths[i+1].path = tspPopulation.prevPaths[n2].path.substring(0, crossover) + tspPopulation.prevPaths[n1].path.substring(crossover, tspPopulation.cityNum*8);

                child = []; parent = [];
                child[0] = tspPopulation.paths[i].path.match(/.{1,8}/g);
                child[1] = tspPopulation.paths[i].path.match(/.{1,8}/g);
                parent[0] = tspPopulation.prevPaths[n1].path.match(/.{1,8}/g);
                parent[1] = tspPopulation.prevPaths[n2].path.match(/.{1,8}/g);
//                        for(var t=i; t<=i+1; t++){
//                            alert();
//                            var cities = [];
//                            for(var p=0; p<tspPopulation.paths[i].path.length; p+=8){
//                                cities[p] = tspPopulation.paths[t].path.substr(p, 8);
//                            }
//                            for(var q=0; q<tspPopulation.popSize; q++){
//                                if(cities.indexOf(cities[q])!=cities.lastIndexOf(cities[q])){
//                                    for(var e=0; p<tspPopulation.popSize; p++){
//                                        if(cities.indexOf(("0000000" + e.toString(2)).slice(-8))==-1){
//                                            cities[q]=("0000000" + e.toString(2)).slice(-8);
//                                            break;
//                                        }
//                                    }
//                                }
//                            }
//                            tspPopulation.paths[t].path = cities.join();
//                        }
            }
            break;

        case "UXO":
            for(i=tspPopulation.eliteSize; i<tspPopulation.popSize; i+=2){
                n1 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
                n2 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
                child = []; parent = [];
                child[0] = []; child[1] = [];
                child[0].splice(0,child[0].length);
                child[1].splice(0,child[1].length);
                parent[0] = tspPopulation.prevPaths[n1].path.match(/.{1,8}/g);
                parent[1] = tspPopulation.prevPaths[n2].path.match(/.{1,8}/g);
//console.log(child[0]);
                for(j=0; j<tspPopulation.popSize; j++){
                    rand = Math.floor(Math.random() * 2);
                    if(child[0].indexOf(parent[rand][j])==-1){
                        child[0][j] = parent[rand][j];
                        child[1][j] = parent[(rand+1)%2][j];
                    }
                    else {
                        child[0][j] = parent[(rand+1)%2][j];
                        child[1][j] = parent[rand][j];
                        if(child[0].indexOf(parent[(rand+1)%2][j])!=-1) alert(child[0].indexOf(parent[(rand+1)%2][j]));
                    }
//                            if(child[1].indexOf(parent[(rand+1)%2][j])==-1){
//                                child[1][j] = parent[(rand+1)%2][j];
//                            }
//                            else {
//                                child[1][j] = parent[rand][j];
//                            }
                }
                tspPopulation.paths[i].path = child[0].join('');
                tspPopulation.paths[i+1].path = child[1].join('');
//                        console.log(tspPopulation.prevPaths[i].path + "\n" + tspPopulation.prevPaths[i+1].path + "\n" + tspPopulation.paths[i].path, "\n" + tspPopulation.paths[i+1].path)
            }
            break;

        case "CX":
            for(i=tspPopulation.eliteSize-1; i<tspPopulation.popSize; i+=2){
                n1 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
                n2 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize/2)));
                child = []; parent = [];
                child[0] = []; child[1] = [];
                child[0].splice(0,child[0].length);
                child[1].splice(0,child[1].length);
                parent[0] = tspPopulation.prevPaths[n1].path.match(/.{1,8}/g);
                parent[1] = tspPopulation.prevPaths[n2].path.match(/.{1,8}/g);
                //console.log(i, i+1, n1, n2, child[0]);
                child[0][0] = parent[0][0];
                child[1][0] = parent[1][0];
                var jump = 0, to;

                while (child[0].indexOf(parent[1][jump]) == -1) {
                    //console.log(child[0], parent[1], jump, parent[1][jump]);
                    to = parent[0].indexOf(parent[1][jump]);
                    child[0][to] = parent[0][to];
                    child[1][to] = parent[1][to];
                    jump = to;
                }

                //console.log(i);

                //console.log("awd");
                for(j=0; j<tspPopulation.cityNum; j++) {
                    if(child[0][j] == null) {
                        child[0][j] = parent[1][j];
                        child[1][j] = parent[0][j];
                    }
                }
                //console.log('enter',child[0].join(''));

                //console.log(i);
                tspPopulation.paths[i] = { path : mutate(child[0],tspPopulation.paths[i].longestEdge) };
                tspPopulation.paths[i+1] = { path: mutate(child[1],tspPopulation.paths[i+1].longestEdge) };
                //console.log('leave',tspPopulation.paths[i].path);
            }
            break;

        case "OX":
            for(i=tspPopulation.eliteSize-1; i<tspPopulation.popSize; i+=2) {
                n1 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize / 2)));
                n2 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize / 2)));
                parent = [];
                slice = []; slice[0] = []; slice[1] = [];
                parent[0] = tspPopulation.prevPaths[n1].path.match(/.{1,8}/g);
                parent[1] = tspPopulation.prevPaths[n2].path.match(/.{1,8}/g);
                start = Math.floor(Math.random() * (tspPopulation.cityNum-1)) ;
                end = Math.floor(Math.random() * (tspPopulation.cityNum - start)) + start;
                for (j=start; j<end; j++){
                    slice[0][parent[1].indexOf(parent[0][j])] = parent[0][j];
                    //console.log("slice_" + parent[1].indexOf(parent[0][j]) + "=" +parent[0][j]);
                    slice[1][parent[0].indexOf(parent[1][j])] = parent[1][j];
                }
                //console.log(parent[1]);
                //console.log(slice[0]);
                //console.log(tspPopulation.paths[i].path.length);
                tspPopulation.paths[i] = { path: tspPopulation.prevPaths[n1].path.substring(0, (start)*8) + slice[0].join('') + tspPopulation.prevPaths[n1].path.substring(end*8, tspPopulation.cityNum*8) };
                tspPopulation.paths[i+1] = { path: tspPopulation.prevPaths[n2].path.substring(0, (start)*8) + slice[1].join('') + tspPopulation.prevPaths[n2].path.substring(end*8, tspPopulation.cityNum*8) };
                console.log(i,tspPopulation.paths[i].path.length);
                if(tspPopulation.paths[i].path.length!=160) {

                    console.log(tspPopulation.genNum, tspPopulation.paths[i].path.length);
                    //console.log(tspPopulation.prevPaths[n2].path + "\n" + tspPopulation.prevPaths[n1].path);
                    console.log(tspPopulation.prevPaths[n2].path.substring(0, (start)*8) +"+"+ slice[1].join('') +"+"+ tspPopulation.prevPaths[n2].path.substring(end*8, tspPopulation.cityNum*8));
                }
                    //console.log(i + " === " +start + " - " + end + "\n" + tspPopulation.prevPaths[n1].path.substring(0, (start)*8).length/8 +";"+ slice[0].join('').length/8 +";"+ tspPopulation.prevPaths[n1].path.substring(end*8, tspPopulation.cityNum*8).length/8 +"\n"+ slice[0].join('|'));
                //console.log(tspPopulation.paths[i].path.length);
            }
            break;

        case "APX":
            for(i=tspPopulation.eliteSize-1; i<tspPopulation.popSize; i+=2){
                n1 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize / 2)));
                n2 = Math.floor(Math.random() * (Math.floor(tspPopulation.popSize / 2)));
                parent = []; child = []; child[0] = []; child[1] = [];
                parent[0] = tspPopulation.prevPaths[n1].path.match(/.{1,8}/g);
                parent[1] = tspPopulation.prevPaths[n2].path.match(/.{1,8}/g);
                k = 0;
                for(j=0; child[0].length<tspPopulation.cityNum; j++){
                    //console.log(child[0], (child[0].indexOf(parent[0][j]===-1)), parent[0][j]);
                    //console.log(child[0], (child[0].indexOf(parent[1][j]===-1)), parent[1][j]);
                    //console.log("----");

                    if(parent[0][j] != parent[1][j]){
                        child[0][k] = parent[0][j];
                        child[1][k] = parent[1][j];
                        k++;
                    }
                    else {
                        if (child[0].indexOf(parent[0][j] === -1)) {
                            child[0][k] = parent[0][j];
                            k++;
                            console.log(k);
                        }

                        if (child[1].indexOf(parent[1][j] === -1)) {
                            child[1][k] = parent[1][j];
                            k++;
                            console.log(k);
                        }

                        if (child[0].indexOf(parent[1][j] === -1)) {
                            child[0][k] = parent[1][j];
                            k++;
                            console.log(k);
                        }

                        if (child[1].indexOf(parent[0][j] === -1)){
                            child[1][k] = parent[0][j];
                            k++;
                            console.log(k);
                        }

                    }

                        //else {
                        //    child[0].push((child[0].indexOf(parent[0][j] === -1)) ?  : parent[1][j]);
                        //    child[0].push((child[0].indexOf(parent[1][j] === -1)) ? parent[1][j] : parent[0][j]);
                        //    child[1].push((child[1].indexOf(parent[1][j] === -1)) ? parent[1][j] : parent[0][j]);
                        //    child[1].push((child[1].indexOf(parent[0][j] === -1)) ? parent[0][j] : parent[1][j]);
                        //}

                    //if(child[0].length === tspPopulation.cityNum)

                }
                tspPopulation.paths[i] = { path : child[0].join('') };
                tspPopulation.paths[i+1] = { path: child[1].join('') };
                //console.log(parent[0].join('.'));
                //console.log(parent[1].join('.'));
                //console.log(child[0].join('.'));
                //console.log(child[1].join('.'));
                //console.log("-----------");
            }
            break;
    }

    //console.log(tspPopulation.paths[10].dist,tspPopulation.paths[10].path);

    for(i=0; i<tspPopulation.popSize; i++){
        var distance = 0, dist;
        var longestEdge = 0
        var r="";

        //console.log(tspPopulation.paths[i].path.length);
        for(k=0; k<tspPopulation.cityNum*8; k+=8){
            if(k+8>=tspPopulation.cityNum*8){
                //console.log(i);
                dist = tspPopulation.distances[parseInt(tspPopulation.paths[i].path.substr(k, 8), 2)][parseInt(tspPopulation.paths[i].path.substr(0, 8), 2)];
                longestEdge = dist>longestEdge?dist:longestEdge;
                distance += dist;
            }
            else{
                //console.log(i);
                dist = tspPopulation.distances[parseInt(tspPopulation.paths[i].path.substr(k,8), 2)][parseInt(tspPopulation.paths[i].path.substr(k+8,8), 2)];
                longestEdge = dist>longestEdge?dist:longestEdge;
                distance += dist;
            }
        }
//                alert(distance);
        tspPopulation.paths[i].dist = distance;
        tspPopulation.paths[i].longestEdge = longestEdge;
        sumDistance += distance;
    }
    //console.log(tspPopulation.paths[11].dist,tspPopulation.paths[11].path);
    tspPopulation.paths = tspPopulation.paths.sort(function(a, b) {
        return a.dist - b.dist;
    });

    //console.log(tspPopulation.paths[11].dist,tspPopulation.paths[11].path);
    tspPopulation.meanDistance = Math.floor(sumDistance/tspPopulation.popSize);

    tspFlags.crossover = 1;
}

function evolve() {
    tspFlags.displayStats = 1;
    tspFlags.elitize = 1;
    tspFlags.mutate = 1;
    tspFlags.crossover = 1;
    tspPopulation.genNum = 0;
    tspPopulation.timer = 0;
    tspFlags.maxGenReached = 0;
    tspFlags.converged = 0;
    tspFlags.finishClicked = 0;
    tspPopulation.countSame = 0;
    //tspPopulation.maxGen = 1;
    tspFlags.startTime = (new Date).getTime();
    timer("start");
    tspFlags.evolutionInterval = setInterval(function(){
//                $("#elapsedTime").val(tspPopulation.timer++);
        if(!tspFlags.maxGenReached && !tspFlags.finishClicked && tspFlags.displayStats && tspFlags.drawPath && tspFlags.elitize && tspFlags.crossover) {

            tspFlags.displayStats = 0;
            tspFlags.elitize = 0;
            tspFlags.mutate = 0;
            tspFlags.crossover = 0;
            tspFlags.drawPath = 0;
            tspPopulation.genNum++;
            tspFlags.maxGenReached = tspPopulation.genNum>=tspPopulation.maxGen;
            tspFlags.converged = tspPopulation.countSame >= tspPopulation.convergance;
            if(tspPopulation.paths[0].dist == tspPopulation.prevPaths[0].dist) tspPopulation.countSame++;
            else tspPopulation.countSame = 0;
            tspPopulation.prevPaths = tspPopulation.paths.slice();
            displayStats();
            elitize();
            crossover();
            displayOnCanvas();

        }
        //console.log(tspFlags.converged, tspFlags.finishClicked, tspFlags.maxGenReached, tspPopulation.countSame, tspPopulation.convergance, tspPopulation.maxGen);

        if(tspFlags.maxGenReached || tspFlags.finishClicked || tspFlags.converged==true){
            timer("stop");
            clearInterval(tspFlags.evolutionInterval);
            tspFlags.displayStats = 1;
            tspFlags.elitize = 1;
            tspFlags.mutate = 1;
            tspFlags.crossover = 1;
            tspFlags.drawPath = 1;
            tspFlags.evolutionFinished = 1;
            console.log("operator:", tspPopulation.mutationOperator,
                "cityNum:", tspPopulation.cityNum,
                "popSize:", tspPopulation.popSize,
                "gen:", tspPopulation.genNum,
                "time:", tspPopulation.timer,
                "best:", tspPopulation.paths[0].dist,
                "mean:", tspPopulation.meanDistance );
            return tspPopulation.paths[0].dist;
        }

    },1);
}