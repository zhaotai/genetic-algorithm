// randomly initialize population(t)
// determine fitness of population(t)
// repeat
//      select parents from population(t)
//      perform crossover on parents creating population(t+1)
//      perform mutation of population(t+1)
//      determine fitness of population(t+1)
// until best individual is good enough

var Population = function(obj) {
    var that = this;
    var onChange = obj.onChange;
    var onEnd = obj.onEnd;
    var target = obj.target;
    var mutateRate = obj.mutateRate;
    var mateRate = obj.mateRate;
    var geneLen = obj.target.length;
    var size = obj.size;
    var maxDiff = getMaxDiff(target);

    // var diedRate = obj.diedRate;

    that.mutateRate = mutateRate;
    that.mateRate = mateRate || 0.5; // assume that 50% of the individuals can mate with others every generation.
    that.geneLen = geneLen;
    // that.diedRate = diedRate;
    that.target = target;
    that.container = [];


    function getMaxDiff(target) {
        var max = 0;
        for (var i = 0; i < geneLen; i ++) {
            max += Math.max(
                Math.abs(33 - target.charCodeAt(i)),
                Math.abs(126 - target.charCodeAt(i))
            );
        }
        return max;
    }

    var randomGene = function(length) {
        var gene = "";
        for (var i = 0; i < length; i ++) {
            var ran = Math.random();
            gene += String.fromCharCode(Math.floor(ran * 93) + 33);
        }
        return gene;
    };
    var fitness = function(idv) {
        var fit = 0;
        for (var i = 0; i < that.geneLen; i ++) {
            if (idv.gene[i] == that.target[i])
                fit += 1;
            // fitness += (127-Math.abs(entity.charCodeAt(i) - this.userData["solution"].charCodeAt(i)))/50;
            fit += (127 - Math.abs(idv.gene.charCodeAt(i) - that.target.charCodeAt(i))) / 50;
        }
        return fit;
    };
    var die = function(diedRate) {
        // var num = diedRate * size;
        var num = that.container.length;
        for (var i = 100; i < num; i ++) {
            that.container.pop();
        }
    };
    var sort = function() {
        that.container.sort(function(a, b) {
           return fitness(b) - fitness(a);
        });
    };

    var select = function(container) {
        var newContainer = [];
        var sum = 0;
        for (var i = 0; i < container.length; i ++) {
            sum += fitness(container[i]);
        }
        for (var i = 0; i < container.length; i ++) {
            var ran = Math.random() * 100;
            if (ran < fitness(container[i])) {
                newContainer.push(container[i]);
            }
        }
        that.container = newContainer;
    };

    var mate = function(mateRate) {
        var nextGeneration = [];
        var mateLength = that.container.length * mateRate;
        for (var i = 0; i < mateLength / 2; i ++) {
            var mateIndex = Math.random() * mateLength;
            var children = that.container[i].mateWith(that.container[mateIndex | 0]);
            nextGeneration.push(children.child1);
            nextGeneration.push(children.child2);
        }
        for (var j = mateLength; j < that.container.length; j ++) {
            nextGeneration.push(that.container[j]);
        }
        that.container = nextGeneration;
    };

    // init
    (function() {
        for (var i = 0; i < size; i ++) {
            that.container.push(new Individual({ gene: randomGene(geneLen), mutateRate: that.mutateRate }));
        }
        sort(that.container);
    })();

    that.begin = function() {
        var count = 0;
        var lastBest = that.container[0];
        var clock = setInterval(function(){
            if (that.container.length > 0 && lastBest.gene !== target && count < 400) {
                mate(mateRate);
                // select(that.container);
                sort();
                // die();
                onChange(that);
                if (fitness(lastBest) == fitness(that.container[0])) count ++;
                else {
                    lastBest = that.container[0];
                    count = 0;
                }
            } else {
                clearInterval(clock);
                onEnd(that);
            }
        }, 0);
    };

    that.getBest = function() {

        var gene = that.container[0].gene;
        var max = fitness(that.container[0]);

        return {
            gene: gene,
            fitness: max
        }
    };
};

var Individual = function(obj) {
    var that = this;
    that.gene = obj.gene;
    that.mutateRate = obj.mutateRate;
    var mutate = function(gene) {

        function replaceAt(str, index, character) {
            return str.substr(0, index) + character + str.substr(index+character.length);
        }

        // chromosomal drift
        var i = Math.floor(Math.random()*gene.length)
        return replaceAt(gene, i, String.fromCharCode(gene.charCodeAt(i) + (Math.floor(Math.random()*2) ? 1 : -1)));

        // var newGene = "";
        // for (var i = 0; i < gene.length; i ++) {
        //     var ran = Math.random();
        //     if (ran < that.mutateRate) {
        //         newGene += String.fromCharCode(Math.floor(ran * 93) + 33);
        //     } else {
        //         newGene += gene[i];
        //     }
        // }
        // return newGene;
    };
    that.mateWith = function(idv) {
        var mother = idv.gene;
        var father = that.gene;
        var len = mother.length;
        var ca = Math.floor(Math.random()*len);
        var cb = Math.floor(Math.random()*len);
        if (ca > cb) {
            var tmp = cb;
            cb = ca;
            ca = tmp;
        }

        var son = father.substr(0,ca) + mother.substr(ca, cb-ca) + father.substr(cb);
        var daughter = mother.substr(0,ca) + father.substr(ca, cb-ca) + mother.substr(cb);

        // var newGene1 = "";
        // var newGene2 = "";
        // for (var i = 0; i < that.gene.length; i ++) {
        //     if (Math.round(Math.random()) === 0) {
        //         newGene1 += that.gene[i];
        //         newGene2 += idv.gene[i];
        //     } else {
        //         newGene1 += idv.gene[i];
        //         newGene2 += that.gene[i];
        //     }
        // }
        return {
            child1: new Individual({ gene: mutate(son), mutateRate: that.mutateRate }),
            child2: new Individual({ gene: mutate(daughter), mutateRate: that.mutateRate })
        };
    };

    that.equals = function(idv) {
        return that.gene === idv.gene;
    }

};