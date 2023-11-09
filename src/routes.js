import { TabNavigator } from './components/Layout/TabNavigator';
import Login from './components/Views/Login/Login';
import Register from './components/Views/Login/Register';
import Perfil from './components/Views/Users/Perfil';
import * as imports from './imports'

import ComponentTester from './Tests/ComponentTest';
import TesteCode from './Tests/TesteCode';
import TheoryView from './components/Shared/TeoricView';
import TestCarousel from './Tests/TestCarousel';
import CongratsView from './components/Shared/CongratsView';
import OptionView from './components/Shared/OptionView';
import SorryView from './components/Shared/SorryView';
import Class from './Aulas/Class';

export const DefaultScreens = [
    { name: "Login", component: Login },
    { name: "Home", component: TabNavigator },
    { name: "Register", component: Register },
    { name: "Perfil", component: Perfil }
];

export const ClassesScreens = [
    { name: "CongratsView", component: CongratsView },
    { name: "SorryView", component: SorryView },
    { name: "OptionView", component: OptionView },
    { name: "Css", component: Class },
    { name: "TestCode", component: TesteCode },
    { name: "TheoryView", component: TheoryView },
    { name: "TestCarousel", component: TestCarousel },
    { name: "Tester", component: ComponentTester },

    //FROM IMPORTS
    { name: "Basic1_html", component: imports.Basic1_html },
    { name: "Basic2_html", component: imports.Basic2_html },
    { name: "Basic3_html", component: imports.Basic3_html },
    { name: "BasicPrat1_html", component: imports.BasicPrat1_html },
    { name: "BasicPrat2_html", component: imports.BasicPrat2_html },
    { name: "BasicPrat3_html", component: imports.BasicPrat3_html },
    { name: "BasicPrat4_html", component: imports.BasicPrat4_html },
    { name: "Estrutura", component: imports.Estrutura },
    { name: "TagsElementos", component: imports.TagsElements },
    { name: "HtmlStartEx1", component: imports.HtmlStartEx1 },
    { name: "HtmlStartEx2", component: imports.HtmlStartEx2 },
    { name: "HtmlStartEx3", component: imports.HtmlStartEx3 },
    { name: "HtmlStartEx4", component: imports.HtmlStartEx4 },
    { name: "HtmlStartEx5", component: imports.HtmlStartEx5 },
    { name: "Header", component: imports.H1h6 },
    { name: "HeaderEx1", component: imports.HeaderEx1 },
    { name: "HeaderEx2", component: imports.HeaderEx2 },
    { name: "HeaderEx3", component: imports.HeaderEx3 },
    { name: "HeaderEx4", component: imports.HeaderEx4 },
    { name: "HeaderEx5", component: imports.HeaderEx5 },
    { name: "HeaderEx6", component: imports.HeaderEx6 },
    { name: "Frases", component: imports.P },
    { name: "FraseEx1", component: imports.FraseEx1 },
    { name: "FraseEx2", component: imports.FraseEx2 },
    { name: "FraseEx3", component: imports.FraseEx3 },
    { name: "FraseEx4", component: imports.FraseEx4 },
    { name: "FraseEx5", component: imports.FraseEx5 },
    { name: "FraseEx6", component: imports.FraseEx6 },
    { name: "ButtonHtml", component: imports.ButtonHtml },
    { name: "ButtonEx1", component: imports.ButtonEx1 },
    { name: "ButtonEx2", component: imports.ButtonEx2 },
    { name: "ButtonEx3", component: imports.ButtonEx3 },
    { name: "ButtonEx4", component: imports.ButtonEx4 },
    { name: "ButtonEx5", component: imports.ButtonEx5 },
    { name: "ButtonEx6", component: imports.ButtonEx6 },
    { name: "ImgTeoric", component: imports.ImgTeoric },
    { name: "Img1", component: imports.Img1 },
    { name: "Img2", component: imports.Img2 },
    { name: "Img3", component: imports.Img3 },
    { name: "Img4", component: imports.Img4 },
    { name: "Img5", component: imports.Img5 },
    { name: "Img6", component: imports.Img6 },
    { name: "Comentario", component: imports.Comentario },
    { name: "ComentarioEx1", component: imports.ComentarioEx1 },
    { name: "ComentarioEx2", component: imports.ComentarioEx2 },
    { name: "ComentarioEx3", component: imports.ComentarioEx3 },
    { name: "ComentarioEx4", component: imports.ComentarioEx4 },
    { name: "ComentarioEx5", component: imports.ComentarioEx5 },
    { name: "ComentarioEx6", component: imports.ComentarioEx6 },
    { name: "Head", component: imports.Head },
    { name: "HeadEx1", component: imports.HeadEx1 },
    { name: "HeadEx2", component: imports.HeadEx2 },
    { name: "HeadEx3", component: imports.HeadEx3 },
    { name: "HeadEx4", component: imports.HeadEx4 },
    { name: "HeadEx5", component: imports.HeadEx5 },
    { name: "HeadEx6", component: imports.HeadEx6 },
    { name: "Body", component: imports.Body },
    { name: "BodyEx1", component: imports.BodyEx1 },
    { name: "BodyEx2", component: imports.BodyEx2 },
    { name: "BodyEx3", component: imports.BodyEx3 },
    { name: "BodyEx4", component: imports.BodyEx4 },
    { name: "BodyEx5", component: imports.BodyEx5 },
    { name: "BodyEx6", component: imports.BodyEx6 },
    { name: "Listas", component: imports.Listas },
    { name: "ListaEx1", component: imports.ListaEx1 },
    { name: "ListaEx2", component: imports.ListaEx2 },
    { name: "ListaEx3", component: imports.ListaEx3 },
    { name: "ListaEx4", component: imports.ListaEx4 },
    { name: "ListaEx5", component: imports.ListaEx5 },
    { name: "ListaEx6", component: imports.ListaEx6 },
    { name: "Links", component: imports.Links },
    { name: "LinksEx1", component: imports.LinksEx1 },
    { name: "LinksEx2", component: imports.LinksEx2 },
    { name: "LinksEx3", component: imports.LinksEx3 },
    { name: "LinksEx4", component: imports.LinksEx4 },
    { name: "LinksEx5", component: imports.LinksEx5 },
    { name: "LinksEx6", component: imports.LinksEx6 },
    { name: "Div", component: imports.Div },
    { name: "DivEx1", component: imports.DivEx1 },
    { name: "DivEx2", component: imports.DivEx2 },
    { name: "LineBreak", component: imports.LineBreak },
    { name: "LineBreakEx1", component: imports.LineBreakEx1 },
    { name: "LineBreakEx2", component: imports.LineBreakEx2 },
    { name: "LineBreakEx3", component: imports.LineBreakEx3 },
    { name: "IndentTeoric", component: imports.IndentTeoric },
    { name: "Indent1", component: imports.Indent1 },
    { name: "Indent2", component: imports.Indent2 },
    { name: "Indent3", component: imports.Indent3 },
    { name: "Indent4", component: imports.Indent4 },
    { name: "Indent5", component: imports.Indent5 },
    { name: "Indent6", component: imports.Indent6 },
    { name: "ITableTeoric", component: imports.ITableTeoric },
    { name: "ITable1", component: imports.ITable1 },
    { name: "ITable2", component: imports.ITable2 },
    { name: "ITable3", component: imports.ITable3 },
    { name: "ITable4", component: imports.ITable4 },
    { name: "ITable5", component: imports.ITable5 },
    { name: "ConhecendoJS", component: imports.ConhecendoJS },
    { name: "JSEx1", component: imports.JSEx1 },
    { name: "JSEx2", component: imports.JSEx2 },
    { name: "JSEx3", component: imports.JSEx3 },
    { name: "JSEx4", component: imports.JSEx4 },
    { name: "JSEx5", component: imports.JSEx5 },
    { name: "Variaveis", component: imports.Variaveis },
    { name: "VariaveisEx1", component: imports.VariaveisEx1 },
    { name: "VariaveisEx2", component: imports.VariaveisEx2 },
    { name: "VariaveisEx3", component: imports.VariaveisEx3 },
    { name: "VariaveisEx4", component: imports.VariaveisEx4 },
    { name: "VariaveisEx5", component: imports.VariaveisEx5 },
    { name: "TiposDados", component: imports.TiposDados },
    { name: "TiposDadosEx1", component: imports.TiposDadosEx1 },
    { name: "TiposDadosEx2", component: imports.TiposDadosEx2 },
    { name: "TiposDadosEx3", component: imports.TiposDadosEx3 },
    { name: "TiposDadosEx4", component: imports.TiposDadosEx4 },
    { name: "TiposDados2", component: imports.TiposDados2 },
    { name: "Interações", component: imports.Interações },
    { name: "InteraçõesEx1", component: imports.InteraçõesEx1 },
    { name: "InteraçõesEx2", component: imports.InteraçõesEx2 },
    { name: "InteraçõesEx3", component: imports.InteraçõesEx3 },
    { name: "InteraçõesEx4", component: imports.InteraçõesEx4 },
    { name: "InteraçõesEx5", component: imports.InteraçõesEx5 },
    { name: "ConvertendoTipos", component: imports.ConvertendoTipos },
    { name: "ConvertendoTiposEx1", component: imports.ConvertendoTiposEx1 },
    { name: "ConvertendoTiposEx2", component: imports.ConvertendoTiposEx2 },
    { name: "ConvertendoTiposEx3", component: imports.ConvertendoTiposEx3 },
    { name: "ConvertendoTiposEx4", component: imports.ConvertendoTiposEx4 },
    { name: "ConvertendoTiposEx5", component: imports.ConvertendoTiposEx5 },
    { name: "Operadores", component: imports.Operadores },
    { name: "OperadoresEx1", component: imports.OperadoresEx1 },
    { name: "OperadoresEx2", component: imports.OperadoresEx2 },
    { name: "OperadoresEx3", component: imports.OperadoresEx3 },
    { name: "OperadoresEx4", component: imports.OperadoresEx4 },
    { name: "OperadoresEx5", component: imports.OperadoresEx5 },
    { name: "OperadoresEx6", component: imports.OperadoresEx6 },
    { name: "OperadoresEx7", component: imports.OperadoresEx7 },
    { name: "Comparação", component: imports.Comparação },
    { name: "ComparaçãoEx1", component: imports.ComparaçãoEx1 },
    { name: "ComparaçãoEx2", component: imports.ComparaçãoEx2 },
    { name: "ComparaçãoEx3", component: imports.ComparaçãoEx3 },
    { name: "ComparaçãoEx4", component: imports.ComparaçãoEx4 },
    { name: "ComparaçãoEx5", component: imports.ComparaçãoEx5 },
    { name: "IfElse", component: imports.IfElse },
    { name: "IfElseEx1", component: imports.IfElseEx1 },
    { name: "IfElseEx2", component: imports.IfElseEx2 },
    { name: "IfElseEx3", component: imports.IfElseEx3 },
    { name: "IfElseEx4", component: imports.IfElseEx4 },
    { name: "IfElseEx5", component: imports.IfElseEx5 },
    { name: "OperadorTernario", component: imports.OperadorTernario },
    { name: "OperadorTernarioEx1", component: imports.OperadorTernarioEx1 },
    { name: "WhileFor", component: imports.WhileFor },
    { name: "WhileForEx1", component: imports.WhileForEx1 },
    { name: "WhileForEx2", component: imports.WhileForEx2 },
    { name: "WhileForEx3", component: imports.WhileForEx3 },
    { name: "WhileForEx4", component: imports.WhileForEx4 },
    { name: "WhileForEx5", component: imports.WhileForEx5 },
    { name: "CriandoDados", component: imports.CriandoDados },
    { name: "CriandoDados2", component: imports.CriandoDados2 },
    { name: "CriandoDados3", component: imports.CriandoDados3 },
    { name: "CriandoDados4", component: imports.CriandoDados4 },
    { name: "CriandoDados5", component: imports.CriandoDados5 },
    { name: "AdicionandoLinhas", component: imports.AdicionandoLinhas },
    { name: "AdicionandoLinhas2", component: imports.AdicionandoLinhas2 },
    { name: "AdicionandoLinhas3", component: imports.AdicionandoLinhas3 },
    { name: "AdicionandoLinhas4", component: imports.AdicionandoLinhas4 },
    { name: "AdicionandoLinhas5", component: imports.AdicionandoLinhas5 },
    { name: "AdicionandoLinhas6", component: imports.AdicionandoLinhas6 },
    { name: "AdicionandoDados", component: imports.AdicionandoDados },
    { name: "AdicionandoDados2", component: imports.AdicionandoDados2 },
    { name: "AdicionandoDados3", component: imports.AdicionandoDados3 },
    { name: "AdicionandoDados4", component: imports.AdicionandoDados4 },
    { name: "AdicionandoDados5", component: imports.AdicionandoDados5 },
    { name: "AdicionandoDados6", component: imports.AdicionandoDados6 },
    { name: "TiposDeDados", component: imports.TiposDeDados },
    { name: "TiposDeDados2", component: imports.TiposDeDados2 },
    { name: "TiposDeDados3", component: imports.TiposDeDados3 },
    { name: "TiposDeDados4", component: imports.TiposDeDados4 },
    { name: "TiposDeDados5", component: imports.TiposDeDados5 },
    { name: "SelecionandoDados", component: imports.SelecionandoDados },
    { name: "SelecionandoDados2", component: imports.SelecionandoDados2 },
    { name: "SelecionandoDados3", component: imports.SelecionandoDados3 },
    { name: "SelecionandoDados4", component: imports.SelecionandoDados4 },
    { name: "SelecionandoDados5", component: imports.SelecionandoDados5 },
    { name: "SelecionandoDados6", component: imports.SelecionandoDados6 },
    { name: "MostrandoVideos", component: imports.MostrandoVideos },
    { name: "MostrandoVideos2", component: imports.MostrandoVideos2 },
    { name: "MostrandoVideos3", component: imports.MostrandoVideos3 },
    { name: "MostrandoVideos4", component: imports.MostrandoVideos4 },
    { name: "MostrandoVideos5", component: imports.MostrandoVideos5 },
    { name: "AdicionandoBordas", component: imports.AdicionandoBordas },
    { name: "AdicionandoBordas2", component: imports.AdicionandoBordas2 },
    { name: "AdicionandoBordas3", component: imports.AdicionandoBordas3 },
    { name: "AdicionandoBordas4", component: imports.AdicionandoBordas4 },
    { name: "AdicionandoBordas5", component: imports.AdicionandoBordas5 },
    { name: "AdicionandoBordas6", component: imports.AdicionandoBordas6 },
    { name: "AdicionandoBordas7", component: imports.AdicionandoBordas7 },
    { name: "ColocandoMargin", component: imports.ColocandoMargin },
    { name: "ColocandoMargin2", component: imports.ColocandoMargin2 },
    { name: "ColocandoMargin3", component: imports.ColocandoMargin3 },
    { name: "ColocandoMargin4", component: imports.ColocandoMargin4 },
    { name: "ColocandoMargin5", component: imports.ColocandoMargin5 },
    { name: "ColocandoMargin6", component: imports.ColocandoMargin6 },
    { name: "AdicionandoPadding", component: imports.AdicionandoPadding },
    { name: "AdicionandoPadding2", component: imports.AdicionandoPadding2 },
    { name: "AdicionandoPadding3", component: imports.AdicionandoPadding3 },
    { name: "AdicionandoPadding4", component: imports.AdicionandoPadding4 },
    { name: "AdicionandoPadding5", component: imports.AdicionandoPadding5 },
    { name: "AdicionandoPadding6", component: imports.AdicionandoPadding6 },
    { name: "ConhecendoCSS", component: imports.ConhecendoCSS },
    { name: "CSSEx1", component: imports.CSSEx1 },
    { name: "CSSEx2", component: imports.CSSEx2 },
    { name: "CSSEx3", component: imports.CSSEx3 },
    { name: "ColorCSS", component: imports.ColorCSS },
    { name: "ColorEx1", component: imports.ColorEx1 },
    { name: "ColorEx2", component: imports.ColorEx2 },
    { name: "BackgroundColorCSS", component: imports.BackgroungColorCSS },
    { name: "BackgroungColorEx1", component: imports.BackgroungColorEx1 },
    { name: "BackgroungColorEx2", component: imports.BackgroungColorEx2 },
    { name: "FontSizeCSS", component: imports.FontSizeCSS },
    { name: "FontSizeEx1", component: imports.FontSizeEx1 },
    { name: "FontSizeEx2", component: imports.FontSizeEx2 },
    { name: "FontFamilyCSS", component: imports.FontFamilyCSS },
    { name: "FontFamilyEx1", component: imports.FontFamilyEx1 },
    { name: "FontFamilyEx2", component: imports.FontFamilyEx2 },
];
