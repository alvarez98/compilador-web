const tokensMatch = {
    ID : /^[a-zA-Z$_]{1,1}[a-zA-Z0-9\-_]{0,}$/,
    TD : /^(int|float|boolean|double|char|void)$/,
    CNE : /^[0-9]{1,}$/,
    SPACE : /^ $/,
    ENTER : /^\n$/,
    CNPF : /^[0-9]{1,}\.[0-9]{1,}$/,
    DEL : /[\(|\)|\{|\}]/,
    AS : /^=$/,
    SEP : /,/,
    OA : /^[+|\-|*|/|%]$/
}
const errorTokens = {
    ID : {regex: /^[a-zA-Z$_]{1,1}[a-zA-Z0-9\-_]{0,}/,
        description: ''},
    TD : {regex: /^(int|float|boolean|double|char|void)/,
        description: ''},
    CNE : {regex: /^[0-9]{1,}/,
        description: ''},
    CNPF : {regex: /^[0-9]{1,}\.[0-9]{1,}/,
        description: ''},
    DEL : {regex: /[\(|\)|\{|\}]/,
        description: ''},
    AS : {regex: /^=/,
        description: ''},
    SEP : {regex: /^,/,
        description: ''},
    OA : {regex: /^[+|\-|*|/|%]/,
        description: ''},
}


/** getTokens
 * @description Divide un string en lexemas para validar con expresiones regulares
 * @param {string} code Texto a validar
 * @return {[lexemas]}  Lista de lexemas en el orden en que se muetra en el texto de entrada
 * @return {[tokens]}  Lista de tokens de cada lexema (sin repetirlos)
*/

export function getTokens (code) {
    // Inicia contadores
    const contadores = {
        ID: 1,
        TD: 1,
        AS: 1,
        CNE: 1,
        CNPF: 1,
        DEL: 1,
        SEP: 1,
        OA: 1,
        SPACE:1,
        ENTER:1
    }
    const contErr = {
        ID : 1,
        TD : 1,
        CNE : 1,
        CNPF : 1,
        DEL : 1,
        AS : 1,
        SEP : 1,
        OA : 1
    }
    // Obtiene los lexemas, limpia espacios vacios y repetidos. Inicia variables
    let lex = code.split(/(\n|\s|\)|,)/)
    lex = lex.filter(Boolean)
    let lexemas = [...new Set(lex)],
        resMatch,
        token,
        line = 1,
        errors = [],
        tokens = [],
        errMatch,
        tokenErr
    
    for (let lex in lexemas){
        let lexema = lexemas[lex]
        token = null
        // Compara cada lexema con cada regex
        for (const key in tokensMatch) {
            resMatch = tokensMatch[key].exec(lexema)

            if (resMatch) {     
                token = {
                    lexema: resMatch[0],
                    token: key
                }
            }
        }
        if (token) {
            // Aumenta el contador para saber en que linea se encuentra el ciclo
            line += token.token === "ENTER" ? 1 : 0 
            // Agrega el identificador al token
            token.token += (contadores[token.token]++)
            tokens.push(token)
        } else {
            // Compara cada lexema con los regex de error
            for (const key in errorTokens) {
                errMatch = errorTokens[key].regex.exec(lexema)
                if (errMatch) {     
                    tokenErr = {
                        lexema: errMatch.input,
                        token: 'ERLX' + key + contErr[key],
                        description: errorTokens[key].description,
                        line
                    }
                }
            }
            tokens.push(tokenErr)
            errors.push(tokenErr)
        }
    }
    
    for(let t in tokens) {        
        for(let l in lex) {
            if(lex[l] === tokens[t].lexema) lex[l]= tokens[t].token
        }     
    }
    lex = lex.toString()
    // Limpia el texto para el archivo de tokens
    lex = lex.replace(/,/gi, ' ')
    lex = lex.replace(/SPACE1/gi, '')
    lex = lex.replace(/ENTER1( )*/gi, '\n')
    console.log(lex);
    
    return { tokens, lex, errors }
}


