//TESTEANDO FUNCTION HANDLER
import Context from '../compiler/classes/context.js'
import { functionHandler } from '../compiler/matchers/function.js'

//void prueba1 ()
//int suma (int a, int b, bool f)
//voi9d prueba1()
//int suma@ (int a, int b, bool c)

const codeLines = [
    ['void', 'prueba1', '(', ')'],
    ['int', 'suma', '(', 'int', 'a', ',', 'int', 'b', ',', 'boolean', 'c', ')'],
]
const scopes = [ 
    null, 
    [ { token: 'ID', lexeme: 'c', dataType: 'int' } ] //Debe dar error por shadowing
] 

const contexts = scopes.map(scope => {
    let c = new Context()
    //Initialize context for while
    if (scope) c.scope = [scope]
    else c.scope = []
    c.expectedTokens = ['TDF']
    return c
})

const handlers = contexts.map(context => {
    const handler = functionHandler(context)
    return handler
})

function showContext(context){
    return {
        expectedTokens: context.expectedTokens
    }
}

function test(){
    const results = []
    for(let key = 0; key < codeLines.length; key++){
        const line = codeLines[key], handler = handlers[key]

        const result = []
        for (const lexeme of line){
            result.push(handler(lexeme))
        }
        results.push(result)
    }

    for(const key in results){
        console.log(`RESULT # ${key}`)
        console.log(results[key])
        console.log(showContext(contexts[key]))
    }
}

test()