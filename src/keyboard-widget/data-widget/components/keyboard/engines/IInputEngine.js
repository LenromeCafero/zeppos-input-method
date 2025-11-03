class IInputEngine {
    processInput(input, context) {} //处理输入，返回结果
    getCandidates(input) {} //获取候选词
    reset() {} //重置引擎状态
}

class EnglishInputEngine extends IInputEngine {} //英文引擎（直接输入）
class PinyinInputEngine extends IInputEngine {} //拼音引擎（智能联想）
class NumberInputEngine extends IInputEngine {} //数字引擎
class SymbolInputEngine extends IInputEngine {} //符号引擎
