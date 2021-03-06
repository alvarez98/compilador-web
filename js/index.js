import { compile } from './compiler/compiler.js'
  
document.addEventListener('DOMContentLoaded', function () {
    new Vue({
        el: '#app',
        data: {
            text: '',
            tokens: [{}],
            triple: [[]],
            errors: [{}],
            lexemes: '',
            tokensLines: [],
            assemblyLines: [{}],
            optimizedCode: ''
        },
        mounted: function() {
            this._editor = new CodeMirror(document.getElementById('codemirror'), {
                lineNumbers: true,
                lineWrapping: true,
                tabSize: 1,
                value: this.text,
                mode:  "javascript",
                theme: 'material-ocean',
                autofocus: true,
                styleSelectedText: true,
                styleActiveLine: { nonEmpty: true },
                scrollbarStyle: 'overlay',
                autoCloseBrackets: true
            });
        
            this._editor.on('changes', () => {
              this.text = this._editor.getValue()
            });
        },
        methods: {
            resetTables (){
                this.tokens.length = 0
                this.errors.length = 0
                this.triple.length = 0
            },
            setValuesToTables ({ tokens, tokenFile, errors, triple, tokensLines, assemblyLines }) {
                this.tokens = tokens
                this.lexemes = tokenFile
                this.errors.push(...errors)
                this.triple = triple
                this.tokensLines = tokensLines
                this.assemblyLines = assemblyLines
            },
            showLexemsInTokenFileTextArea (){
                const textArea = document.getElementById("archivo-token");
                textArea.value = this.lexemes
                const lines = this.lexemes.split("\n")
                textArea.rows = lines.length
            },
            showOptimizedCode (){
                const textArea = document.getElementById("optimized-code");
                this.optimizedCode = this.optimizedCodeToText()
                textArea.value = this.optimizedCode
                const lines = this.optimizedCode.split("\n")
                textArea.rows = lines.length
            },
            enableDownloadButton (){
                const btns = document.querySelectorAll(".download");
                [].forEach.call(btns, btn => {
                    btn.classList.remove("disabled")
                })
                const btnDownloadAll = document.getElementById('download-all')
                btnDownloadAll.classList.remove("disabled")
            },
            compile (){
                this.resetTables()
                this.setValuesToTables(compile(this.text))
                this.showLexemsInTokenFileTextArea()
                this.showOptimizedCode()
                this.enableDownloadButton()
            },
            previewFiles (event){
                const file = event.target.files[0]
                this.readTxt(file)
            },
            showTxt (event){
                this._editor.setValue(event.target.result)
            },
            readTxt (file){
                const arch = new FileReader()
                arch.addEventListener('load', this.showTxt, false)
                arch.readAsText(file)
            },
            tripleTotext(){
                let tripleText = '\n\nTRIPLO\n\nLinea\tOperador\tDato objeto\tDato Fuente\n'
                this.triple.forEach((line, index) => {
                    tripleText += `${index+1}\t${line.join('\t\t')}\n`
                })
                tripleText += '\n'
                return tripleText
            },
            objectCodeTotext(){
                let assemblyLinesText = 'Codigo Objeto\n\nLinea\tEtiqueta\tOperador\tDato Objeto\tDato Fuente\n'
                this.assemblyLines.forEach((line, index) => {
                    assemblyLinesText += `${index+1}\t${line.join('\t\t')}\n`
                })
                assemblyLinesText += '\n'
                return assemblyLinesText
            },
            optimizedCodeToText() {
                let optimizedCode = ''
                if (this.tokensLines.length === 0) {
                    optimizedCode += 'No se genera salida\nLas variables no se utilizan'
                } else {
                    this.tokensLines.forEach(line => {
                        if (line.lineType === 'operation') {
                            line.tokens.forEach(token => {
                                optimizedCode += `${token.lexeme} `
                            })
                        }
                        else if(line.lineType === 'while') {
                            optimizedCode += 'while ('
                            line.tokens.forEach(token => {
                                optimizedCode += ` ${token.lexeme}`
                            })
                            optimizedCode += ' )\n{'
                        }
                        else if(line.lineType === 'whileEnd') {
                            optimizedCode += '}'
                        }
                        optimizedCode += '\n'
                    })
                }
                return optimizedCode
            },
            downloadAll (){
                let fileContent = `Archivo de tokens\n\n${this.lexemes} ${this.tripleTotext()} Código Optimizado\n\n${this.optimizedCode}`
                fileContent += `\n${this.objectCodeTotext()}`
                this.download('compilado', fileContent)
            },
            downloadTriplo(){
                this.download('triplo', this.tripleTotext())
            },
            downloadTokenFile(){
                this.download('archivo-tokens', `Archivo de tokens\n\n${this.lexemes}`)
            },
            downloadObjectCode () {
                this.download('codigo-objeto', this.objectCodeTotext())
            },
            downloadOptimizedCode() {
                this.download('codigo-optimizado', `Código Optimizado\n\n${this.optimizedCode}`)
            },
            download (filename, fileContent){
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
                element.setAttribute('download', filename);
            
                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();
                document.body.removeChild(element);
            }
        }
    })
})
