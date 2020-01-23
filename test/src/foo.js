// Babel macros should work
import env from 'penv.macro';
import inspect from 'inspect.macro';

const foo = {
    hello: person => {
        const greeting = env({
            development: "HI",
            production: "Salutations"
        })
        inspect(`${greeting}, ${person}!`);
    }
}

export default foo;