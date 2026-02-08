
import { cleanContent, invertHtmlColors } from '../src/utils/textUtils';

console.log('Running Rendering Tests...');

const cleanTests = [
    {
        name: 'Strip H1 and Span',
        input: '<h1><span>Title</span></h1><p>Body</p>',
        expected: 'Title\n\nBody'
    },
    {
        name: 'Handle Entities',
        input: 'You&nbsp;are&nbsp;cool',
        expected: 'You are cool'
    },
    {
        name: 'Preserve Newlines in P',
        input: '<p>Line 1</p><p>Line 2</p>',
        expected: 'Line 1\n\nLine 2'
    }
];

let cleanPassed = 0;
cleanTests.forEach(t => {
    const result = cleanContent(t.input);
    if (result === t.expected) {
        cleanPassed++;
    } else {
        console.error(`[FAIL - Clean] ${t.name}`);
    }
});

const invertTests = [
    {
        name: 'Invert Black to White',
        input: '<span style="color: black">Text</span>',
        expected: '<span style="color: #e2e8f0">Text</span>'
    },
    {
        name: 'Invert RGB Black to White',
        input: '<span style="color: rgb(0, 0, 0)">Text</span>',
        expected: '<span style="color: #e2e8f0">Text</span>'
    },
    {
        name: 'Invert Dark Gray to White',
        input: '<span style="color: rgb(31, 31, 31)">Text</span>',
        expected: '<span style="color: #e2e8f0">Text</span>'
    },
    {
        name: 'Keep Red',
        input: '<span style="color: red">Text</span>',
        expected: '<span style="color: red">Text</span>'
    },
    {
        name: 'Keep Light Color',
        input: '<span style="color: #ffffff">Text</span>',
        expected: '<span style="color: #ffffff">Text</span>'
    }
];

let invertPassed = 0;
invertTests.forEach(t => {
    const result = invertHtmlColors(t.input);
    if (result === t.expected) {
        invertPassed++;
    } else {
        console.error(`[FAIL - Invert] ${t.name}`);
        console.error(`Expected: ${t.expected}`);
        console.error(`Actual:   ${result}`);
    }
});


console.log(`\nClean Tests: ${cleanPassed}/${cleanTests.length}`);
console.log(`Invert Tests: ${invertPassed}/${invertTests.length}`);
