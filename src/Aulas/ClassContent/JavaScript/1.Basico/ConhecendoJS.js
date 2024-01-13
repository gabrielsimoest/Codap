import React from 'react';
import { useTranslation } from 'react-i18next';
import TheoryView from '../../../../components/Shared/TheoryView';
import OptionView from '../../../../components/Shared/OptionView';
import SelectView from '../../../../components/Shared/SelectView';
import TextView from '../../../../components/Shared/TextView';
import NestingView from '../../../../components/Shared/NestingView';

export function ConhecendoJS({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="0%"
            mainText={t("js.basic.intro.helloCodyLetsLearnJS")}
            secondText={t("js.basic.intro.jsForWebsites")}
            thirdText={t("js.basic.intro.usingScriptTag")}
            codeLanguage='HTML'
            code={
                `<!DOCTYPE html>
<html>
    <body>

        <h1>JavaScript Test</h1>

        <h2 id="demo">Hello World!</h2>

        <button type="button" onclick="changeText()">Click Me!</button>
        <button type="button" onclick="changeText2()">Click Me Too!</button>

        <script>
            function changeText() {
                document.getElementById("demo").innerHTML = "Hello JavaScript!";
            }

            function changeText2() {
                document.getElementById("demo").innerHTML = "Hello World!";
            }
        </script>

    </body>
</html>`}
            endText={t("js.basic.intro.outsideScriptTag")}
            highlight={["script", "JS", "JavaScript", "Cody"]}
            navegar="JSEx1"
        />
    )
}

export function JSEx1({ navigation }) {
    const { t } = useTranslation();
    return (
        <TextView
            navigation={navigation}
            progresso={"20%"}
            sec={9999}
            adicionaltxt={t("js.basic.intro.startWithHelloWorld")}
            pergunta={t("js.basic.intro.completeAlertWithString")}
            txtantes='alert('
            txtdepois=')'
            txtCerto1='"HELLO WORLD"'
            txtCerto2='"Hello world"'
            txtCerto3='"hello world"'
            tamanhoInput="75%"
            txtToHighlight={["HELLO WORLD", "don't forget the quotes", "não esqueça as áspas", "string"]}
            navegar="JSEx2"
        />
    )
}

export function JSEx2({ navigation }) {
    const { t } = useTranslation();
    return (
        <NestingView
            navigation={navigation}
            progresso="40%"
            sec="9999"
            qtdop={2}
            layer={1}
            adicionaltxt={t("js.basic.intro.semicolonUsageInJS")}
            pergunta={t("js.basic.intro.createTwoAlertsNoSemicolon")}
            txtantes="<script>"
            txtdepois="</script>"
            txtCerto1='alert("HELLO WORLD");'
            txtCerto2='alert("CODAP");'
            tamanhoInput="60%"
            txtToHighlight={["HELLO WORLD", "CODAP", "JavaScript"]}
            navegar="JSEx3"
        />
    )
}

export function JSEx3({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="60%"
            sec="9999"
            adicionaltxt={t("js.basic.intro.correctUseOfAlert")}
            opt1="alert(=>CODAP)"
            opt2="alert=CODAP"
            opt3='alert("CODAP")'
            opt4="alert{CODAP}"
            optCerta="opt3"
            txtToHighlight={["alert"]}
            navegar="JSEx4"
        />
    )
}

export function JSEx4({ navigation }) {
    const { t } = useTranslation();
    return (
        <OptionView
            navigation={navigation}
            progresso="80%"
            sec="9999"
            adicionaltxt={t("js.basic.intro.whatToAddForJSFunction")}
            opt1="<script>"
            opt2="<JavaScript>"
            opt3="<code>"
            opt4="<js>"
            optCerta="opt1"
            txtToHighlight={["JavaScript"]}
            navegar="JSEx5"
        />
    )
}

export function JSEx5({ navigation }) {
    const { t } = useTranslation();
    return (
        <SelectView
            navigation={navigation}
            progresso="90%"
            sec="9999"
            adicionaltxt={t("js.basic.intro.createAnAlert")}
            opt1='alert'
            opt2=')'
            opt3='"CODAP"'
            opt4='('
            opt5=';'
            txtCerto='alert("CODAP");'
            txtToHighlight={["alert"]}
            navegar="JSEx6"
        />
    )
}

export function JSEx6({ navigation }) {
    const { t } = useTranslation();
    return (
        <TheoryView
            navigation={navigation}
            progresso="100%"
            mainText={t("js.basic.intro.modernJSCodeUsage")}
            secondText={t("js.basic.intro.useStrict")}
            thirdText={t("js.basic.intro.example")}
            onlyCode = {true}
            codeLanguage='HTML'
            code={
                `<!DOCTYPE html>
<html>

    <head>
        <title>Strict Mode Example</title>
    </head>

    <body>
            <script>
            "use strict";
            // All the code in strict mode
            function test() {
                // Also strict mode
            }
        </script>
    </body>
</html>`}
            highlight={["script", "JS", "JavaScript", "Cody","use strict"]}
            Salvar={true}
            aulaSalvar={29}
            navegar="CongratsView"
        />
    )
}