export function calculateTotalScore(marks, framework, customize_weight) {
    console.log(marks);
    /* {e: 50, s: 100, g: 0} */
    const {e, s, g} = marks;
    /* UNDEFINED */
    const {ew, sw, gw} = customize_weight;
    console.log(e, s, g);
    console.log(ew, sw, gw);
    console.log(framework);
    
    let score = 0;
    if (framework.value === "IFRS S1") {
        score = e * 0.3 + s * 0.35 + g * 0.35;
        console.log(score);
    }
    else if (framework.value === "IFRS S2") {
        score = e * 0.5 + s * 0.25 + g * 0.25;
        console.log(score);
    }
    else if (framework.value === "TCFD") {
        score = e * 0.5 + s * 0.2 + g * 0.3;
        console.log(score);
    }
    else if (framework.value === "CUSTOMIZE") {
        console.log(e, s, g);
        console.log(ew, sw, gw);
        score = e * sw + s * sw + g * gw;
        console.log(score);
    }
    return {score};
  }

