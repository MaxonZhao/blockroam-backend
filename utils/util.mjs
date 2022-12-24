export class RandomUtils {
    constructor() {}
    static getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }
    
    static getRandomFloat(max, decimals) {
        return (Math.random() * max).toFixed(decimals)
    }

    static getRandomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
}

// module.exports = {RandomUtils}