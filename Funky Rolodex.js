process.stdin.resume();
process.stdin.setEncoding("ascii");
var input = "";
process.stdin.on("data", function (chunk) {
input += chunk;
});
process.stdin.on("end", function () {
    var arr = input.split('\n');

    var role = new ROLE(arr);
    role.processAll();
});

var ROLE = function (arr) {
    this.rawData = arr;

    this.jsonObj = {
        entries : [],
        errors  : []
    };
}

ROLE.prototype.processAll = function () {
    var me = this;

    for (var i = 0 ; i < me.rawData.length ; i++) {
        me.processOneLine(i, me.rawData[i]);
    }

    me.outputJSON();
}

ROLE.prototype.processOneLine = function (index, data) {
    var me = this,
        pArr = data.split(', '),
        nameRe1     = /^.+$/,
        nameRe2     = /^(\w+)\s(.+)$/,
        phoneRe1    = /^\((\d{3})\)-(\d{3})-(\d{4})$/,
        phoneRe2    = /^(\d{3}) (\d{3}) (\d{4})$/,
        zipRe       = /^\d{5}$/,
        colorRe     = /^.+$/;


    if (pArr.length == 4) {
        // type Firstname Lastname, Red, 11237, 703 955 0373
        if (nameRe2.test(pArr[0]) && colorRe.test(pArr[1]) && zipRe.test(pArr[2])
            && phoneRe2.test(pArr[3])) {
            var names = nameRe2.exec(pArr[0]),
                phones = phoneRe2.exec(pArr[3]);
            var obj = [
                pArr[1], // color:
                names[1], // firstname
                names[2], // lastname
                phones[1] + '-' + phones[2] + '-' + phones[3], // phonenumber
                pArr[2] // zipcode
            ]
        }
    } else  if (pArr.length == 5){
        // type Lastname, Firstname, (703)-742-0996, Blue, 10013
        if (nameRe1.test(pArr[0]) && nameRe1.test(pArr[1]) && phoneRe1.test(pArr[2])
            && colorRe.test(pArr[3]) && zipRe.test(pArr[4])
            ) {
            var phones = phoneRe1.exec(pArr[2]);
            var obj = [
                pArr[3], // color
                pArr[1], // firstname
                pArr[0], // lastname
                phones[1] + '-' + phones[2] + '-' + phones[3], // phonenumber
                pArr[4] // zipcode
            ]
        }
        // type Firstname, Lastname, 10013, 646 111 0101, Green
        else if (nameRe1.test(pArr[0]) && nameRe1.test(pArr[1]) && zipRe.test(pArr[2])
            && phoneRe2.test(pArr[3]) && colorRe.test(pArr[4])
            ) {
            var phones = phoneRe2.exec(pArr[3]);
            var obj = [
                pArr[4], // color
                pArr[0], // firstname
                pArr[1], // lastname
                phones[1] + '-' + phones[2] + '-' + phones[3], // phonenumber
                pArr[2] // zipcode
            ]
        }
    }

    if (obj) { // valid
        me.jsonObj.entries.push(obj);
    } else {
        me.jsonObj.errors.push(index);
    }
}

ROLE.prototype.sortEntries = function (a, b) {
    // if (a[2].localeCompare(b[2], 'en-US', {sensitivity: 'variant'}) < 0) {
    //     return -1;
    // } else if (a[2].localeCompare(b[2], 'en-US', {sensitivity: 'variant'}) == 0) {
    //     return a[1].localeCompare(b[1], 'en-US', {sensitivity: 'variant'});
    // } else {
    //     return 1;
    // }
    if (a[2] < b[2]) {
        return -1;
    } else if (a[2] == b[2]) {
        if (a[1] < b[1]) {
            return -1;
        } else if (a[1] == b[1]) {
            return 0;
        } else {
            return 1;
        }
    } else {
        return 1;
    }
}

ROLE.prototype.outputJSON = function () {
    var me = this,
        obj = me.jsonObj,
        oneIndent = '  ',
        twoIndent = oneIndent + oneIndent,
        threeIndent = oneIndent + twoIndent;

    obj.entries.sort(me.sortEntries);

    var str = '{\n';
    str += oneIndent + '"entries": [\n';
    for (var i = 0; i < obj.entries.length; i++) {
        var p = obj.entries[i];

        str += twoIndent + '{\n';
        str += threeIndent + '"color": "' + p[0] + '",\n';
        str += threeIndent + '"firstname": "' + p[1] + '",\n';
        str += threeIndent + '"lastname": "' + p[2] + '",\n';
        str += threeIndent + '"phonenumber": "' + p[3] + '",\n';
        str += threeIndent + '"zipcode": "' + p[4] + '"\n';
        str += twoIndent + '}';

        if (i != obj.entries.length - 1) {
            str += ',';
        }
        str += '\n';
    }
    str += oneIndent + '],\n';
    str += oneIndent + '"errors": [\n';
    for (var i = 0; i < obj.errors.length; i++) {
        str += twoIndent + obj.errors[i];

        if (i != obj.errors.length - 1) {
            str += ',';
        }

        str += '\n';
    }
    str += oneIndent + ']\n';
    str += '}\n';

    process.stdout.write(str);
}
