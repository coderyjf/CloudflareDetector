// ==UserScript==
// @name         Cloudflare Detector
// @namespace    https://github.com/coderyjf/CloudflareDetector
// @version      1.4.3
// @description  Cloudflare 节点检测（PC + 移动端优化 / IP / Colo / 状态 / 可拖拽 / 长按拖动 / 复制）
// @author       coderyjf
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      *
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cloudflare.com
// @license      MIT
// @downloadURL  https://github.com/coderyjf/CloudflareDetector/releases/latest/download/cloudflare-detector.user.js
// @updateURL    https://github.com/coderyjf/CloudflareDetector/releases/latest/download/cloudflare-detector.user.js
// ==/UserScript==

(function () {
  "use strict";

  /* =========================
           ⚙️ 配置
  ========================= */

  const CACHE_KEY = "cf_lite_pp";
  const CACHE_TTL = 30000;
  const POS_KEY = "cf_detector_pos_v5";
  const PANEL_GAP = 12;

  const IS_MOBILE =
    /Android|iPhone|iPad|iPod|HarmonyOS|Mobile/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  const ICON_SIZE = IS_MOBILE ? 36 : 40;

  const LONG_PRESS_TIME = 220;

  /* =========================
         🌍 机场三字码
  ========================= */

  const coloMap = {
    // ==================== 亚洲 ====================

    // 中国 (China)
    KHN: "南昌",
    CAN: "广州",
    SZX: "深圳",
    SHA: "上海虹桥",
    PVG: "上海浦东",
    PEK: "北京首都",
    BJS: "北京",
    CKG: "重庆",
    CTU: "成都",
    KMG: "昆明",
    XIY: "西安",
    HGH: "杭州",
    WUH: "武汉",
    CSX: "长沙",
    SHE: "沈阳",
    DLC: "大连",
    TAO: "青岛",
    XMN: "厦门",
    NGB: "宁波",
    NKG: "南京",
    HRB: "哈尔滨",
    TSN: "天津",
    URC: "乌鲁木齐",
    LXA: "拉萨",
    KWE: "贵阳",
    FOC: "福州",
    CZX: "常州",
    CGD: "常德",
    ACX: "兴义",
    BHY: "北海",
    CGO: "郑州",
    FUO: "佛山",
    HAK: "海口",
    HFE: "合肥",
    HYN: "台州",
    JXG: "嘉兴",
    LHW: "兰州",
    LYA: "洛阳",
    NNG: "南宁",
    PKX: "北京大兴",
    SJW: "石家庄",
    TEN: "铜仁",
    TNA: "济南",
    TYN: "太原",
    WHU: "芜湖",
    XFN: "襄阳",
    XNN: "西宁",
    ZGN: "中山",
    TPE: "台北",
    KHH: "高雄",
    HKG: "香港",
    MFM: "澳门",

    // 日本 (Japan)
    NRT: "东京成田",
    HND: "东京羽田",
    KIX: "大阪",
    NGO: "名古屋",
    FUK: "福冈",
    OKA: "冲绳",

    // 韩国 (South Korea)
    ICN: "首尔",
    PUS: "釜山",

    // 蒙古 (Mongolia)
    ULN: "乌兰巴托",

    // 新加坡 (Singapore)
    SIN: "新加坡",

    // 马来西亚 (Malaysia)
    KUL: "吉隆坡",
    KCH: "古晋",
    JHB: "新山",

    // 印度尼西亚 (Indonesia)
    CGK: "雅加达",
    DPS: "巴厘岛",
    JOG: "日惹",
    MLG: "玛琅",

    // 菲律宾 (Philippines)
    MNL: "马尼拉",
    CEB: "宿务",
    CRK: "安吉利斯",
    CGY: "卡加延德奥罗",

    // 泰国 (Thailand)
    BKK: "曼谷",
    CNX: "清迈",
    URT: "素叻他尼",

    // 越南 (Vietnam)
    SGN: "胡志明市",
    HAN: "河内",
    DAD: "岘港",

    // 老挝 (Laos)
    VTE: "万象",

    // 柬埔寨 (Cambodia)
    PNH: "金边",

    // 缅甸 (Myanmar)
    RGN: "仰光",

    // 文莱 (Brunei)
    BWN: "斯里巴加湾",

    // 印度 (India)
    DEL: "新德里",
    BOM: "孟买",
    MAA: "金奈",
    BLR: "班加罗尔",
    HYD: "海得拉巴",
    CCU: "加尔各答",
    AMD: "艾哈迈达巴德",
    AGR: "阿格拉",
    BBI: "布巴内斯瓦尔",
    CJB: "哥印拜陀",
    COK: "科钦",
    CNN: "坎努尔",
    IXC: "昌迪加尔",
    KNU: "坎普尔",
    NAG: "那格浦尔",
    PAT: "巴特那",
    PNQ: "浦那",

    // 巴基斯坦 (Pakistan)
    KHI: "卡拉奇",
    LHE: "拉合尔",
    ISB: "伊斯兰堡",

    // 孟加拉国 (Bangladesh)
    DAC: "达卡",
    CGP: "吉大港",
    JSR: "杰索尔",

    // 斯里兰卡 (Sri Lanka)
    CMB: "科伦坡",

    // 尼泊尔 (Nepal)
    KTM: "加德满都",

    // 不丹 (Bhutan)
    PBH: "廷布",

    // 马尔代夫 (Maldives)
    MLE: "马累",

    // 哈萨克斯坦 (Kazakhstan)
    NQZ: "阿斯塔纳",
    ALA: "阿拉木图",
    AKX: "阿克托别",

    // 乌兹别克斯坦 (Uzbekistan)
    TAS: "塔什干",

    // 吉尔吉斯斯坦 (Kyrgyzstan)
    FRU: "比什凯克",

    // 塔吉克斯坦 (Tajikistan) - 暂无数据

    // 土库曼斯坦 (Turkmenistan) - 暂无数据

    // 阿富汗 (Afghanistan) - 暂无数据

    // 伊朗 (Iran) - 暂无数据

    // 伊拉克 (Iraq)
    BGW: "巴格达",
    BSR: "巴士拉",
    EBL: "埃尔比勒",
    ISU: "苏莱曼尼亚",
    NJF: "纳杰夫",
    XNH: "纳西里耶",

    // 叙利亚 (Syria) - 暂无数据

    // 黎巴嫩 (Lebanon)
    BEY: "贝鲁特",

    // 约旦 (Jordan)
    AMM: "安曼",

    // 以色列 (Israel)
    TLV: "特拉维夫",
    HFA: "海法",

    // 巴勒斯坦 (Palestine)
    ZDM: "拉马拉",

    // 沙特阿拉伯 (Saudi Arabia)
    JED: "吉达",
    RUH: "利雅得",
    DMM: "达曼",

    // 也门 (Yemen) - 暂无数据

    // 阿曼 (Oman)
    MCT: "马斯喀特",

    // 阿联酋 (UAE)
    DXB: "迪拜",
    AUH: "阿布扎比",

    // 卡塔尔 (Qatar)
    DOH: "多哈",

    // 巴林 (Bahrain)
    BAH: "麦纳麦",

    // 科威特 (Kuwait)
    KWI: "科威特城",

    // 土耳其 (Turkey)
    IST: "伊斯坦布尔",
    ADB: "伊兹密尔",
    ANK: "安卡拉",

    // 塞浦路斯 (Cyprus)
    LCA: "尼科西亚",

    // 高加索地区
    EVN: "埃里温", // 亚美尼亚
    GYD: "巴库", // 阿塞拜疆
    TBS: "第比利斯", // 格鲁吉亚
    LLK: "阿斯塔拉", // 阿塞拜疆

    // ==================== 欧洲 ====================

    // 俄罗斯 (Russia)
    DME: "莫斯科",
    LED: "圣彼得堡",
    KJA: "克拉斯诺亚尔斯克",
    SVX: "叶卡捷琳堡",

    // 乌克兰 (Ukraine)
    KBP: "基辅",

    // 白俄罗斯 (Belarus)
    MSQ: "明斯克",

    // 摩尔多瓦 (Moldova)
    KIV: "基希讷乌",

    // 立陶宛 (Lithuania)
    VNO: "维尔纽斯",

    // 拉脱维亚 (Latvia)
    RIX: "里加",

    // 爱沙尼亚 (Estonia)
    TLL: "塔林",

    // 芬兰 (Finland)
    HEL: "赫尔辛基",

    // 瑞典 (Sweden)
    ARN: "斯德哥尔摩",
    GOT: "哥德堡",

    // 挪威 (Norway)
    OSL: "奥斯陆",

    // 丹麦 (Denmark)
    CPH: "哥本哈根",

    // 冰岛 (Iceland)
    KEF: "雷克雅未克",

    // 爱尔兰 (Ireland)
    DUB: "都柏林",
    ORK: "科克",

    // 英国 (United Kingdom)
    LHR: "伦敦希思罗",
    LGW: "伦敦盖特威克",
    MAN: "曼彻斯特",
    EDI: "爱丁堡",
    BHX: "伯明翰",
    GLA: "格拉斯哥",

    // 荷兰 (Netherlands)
    AMS: "阿姆斯特丹",
    RTM: "鹿特丹",

    // 比利时 (Belgium)
    BRU: "布鲁塞尔",

    // 卢森堡 (Luxembourg)
    LUX: "卢森堡",

    // 法国 (France)
    CDG: "巴黎戴高乐",
    ORY: "巴黎奥利",
    MRS: "马赛",
    LYS: "里昂",
    NCE: "尼斯",
    BOD: "波尔多",
    RUN: "留尼汪",

    // 德国 (Germany)
    FRA: "法兰克福",
    MUC: "慕尼黑",
    DUS: "杜塞尔多夫",
    TXL: "柏林泰格尔",
    BER: "柏林勃兰登堡",
    HAM: "汉堡",
    STR: "斯图加特",
    HAJ: "汉诺威",

    // 瑞士 (Switzerland)
    ZRH: "苏黎世",
    GVA: "日内瓦",

    // 奥地利 (Austria)
    VIE: "维也纳",

    // 波兰 (Poland)
    WAW: "华沙",
    WRO: "弗罗茨瓦夫",
    KRK: "克拉科夫",

    // 捷克 (Czech Republic)
    PRG: "布拉格",

    // 斯洛伐克 (Slovakia)
    BTS: "布拉迪斯拉发",

    // 匈牙利 (Hungary)
    BUD: "布达佩斯",

    // 斯洛文尼亚 (Slovenia)
    LJU: "卢布尔雅那",

    // 克罗地亚 (Croatia)
    ZAG: "萨格勒布",

    // 塞尔维亚 (Serbia)
    BEG: "贝尔格莱德",

    // 波斯尼亚和黑塞哥维那 - 暂无数据

    // 黑山 - 暂无数据

    // 阿尔巴尼亚 (Albania)
    TIA: "地拉那",

    // 北马其顿 (North Macedonia)
    SKP: "斯科普里",

    // 保加利亚 (Bulgaria)
    SOF: "索菲亚",

    // 罗马尼亚 (Romania)
    OTP: "布加勒斯特",
    CLJ: "克卢日",

    // 希腊 (Greece)
    ATH: "雅典",
    SKG: "塞萨洛尼基",
    HER: "伊拉克利翁",

    // 马耳他 (Malta)
    MLA: "瓦莱塔",

    // 意大利 (Italy)
    MXP: "米兰马尔彭萨",
    LIN: "米兰利纳特",
    BGY: "贝加莫",
    FCO: "罗马菲乌米奇诺",
    NAP: "那不勒斯",
    VCE: "威尼斯",
    PMO: "巴勒莫",

    // 西班牙 (Spain)
    MAD: "马德里",
    BCN: "巴塞罗那",
    VLC: "瓦伦西亚",
    AGP: "马拉加",
    SVQ: "塞维利亚",

    // 葡萄牙 (Portugal)
    LIS: "里斯本",
    OPO: "波尔图",

    // 直布罗陀 (Gibraltar) - 暂无

    // ==================== 非洲 ====================

    // 摩洛哥 (Morocco)
    CMN: "卡萨布兰卡",
    RAK: "马拉喀什",

    // 阿尔及利亚 (Algeria)
    ALG: "阿尔及尔",
    ORN: "奥兰",
    CZL: "康斯坦丁",
    AAE: "安纳巴",

    // 突尼斯 (Tunisia)
    TUN: "突尼斯",

    // 利比亚 (Libya) - 暂无

    // 埃及 (Egypt)
    CAI: "开罗",
    ALY: "亚历山大",

    // 苏丹 (Sudan) - 暂无

    // 毛里塔尼亚 (Mauritania) - 暂无

    // 塞内加尔 (Senegal)
    DKR: "达喀尔",
    DSS: "达喀尔新",

    // 冈比亚 (Gambia) - 暂无

    // 马里 (Mali)
    BKO: "巴马科",

    // 布基纳法索 (Burkina Faso)
    OUA: "瓦加杜古",

    // 科特迪瓦 (Ivory Coast)
    ABJ: "阿比让",
    ASK: "亚穆苏克罗",

    // 加纳 (Ghana)
    ACC: "阿克拉",

    // 多哥 (Togo)
    LFW: "洛美",

    // 贝宁 (Benin)
    COO: "科托努",

    // 尼日尔 (Niger) - 暂无

    // 尼日利亚 (Nigeria)
    LOS: "拉各斯",
    ABV: "阿布贾",

    // 喀麦隆 (Cameroon) - 暂无

    // 赤道几内亚 - 暂无

    // 加蓬 (Gabon) - 暂无

    // 刚果布 (Congo) - 暂无

    // 刚果金 (DRC)
    FIH: "金沙萨",

    // 中非 - 暂无

    // 卢旺达 (Rwanda)
    KGL: "基加利",

    // 布隆迪 (Burundi) - 暂无

    // 乌干达 (Uganda)
    EBB: "坎帕拉",

    // 肯尼亚 (Kenya)
    NBO: "内罗毕",
    MBA: "蒙巴萨",

    // 坦桑尼亚 (Tanzania)
    DAR: "达累斯萨拉姆",

    // 莫桑比克 (Mozambique)
    MPM: "马普托",

    // 马拉维 (Malawi)
    LLW: "利隆圭",

    // 赞比亚 (Zambia)
    LUN: "卢萨卡",

    // 津巴布韦 (Zimbabwe)
    HRE: "哈拉雷",

    // 博茨瓦纳 (Botswana)
    GBE: "哈博罗内",

    // 纳米比亚 (Namibia)
    WDH: "温得和克",

    // 南非 (South Africa)
    JNB: "约翰内斯堡",
    CPT: "开普敦",
    DUR: "德班",

    // 马达加斯加 (Madagascar)
    TNR: "塔那那利佛",

    // 毛里求斯 (Mauritius)
    MRU: "路易港",

    // 吉布提 (Djibouti)
    JIB: "吉布提市",

    // 索马里 (Somalia) - 暂无

    // 埃塞俄比亚 (Ethiopia)
    ADD: "亚的斯亚贝巴",

    // 厄立特里亚 (Eritrea) - 暂无

    // 南苏丹 (South Sudan) - 暂无

    // ==================== 北美洲 ====================

    // 加拿大 (Canada)
    YVR: "温哥华",
    YYC: "卡尔加里",
    YEG: "埃德蒙顿",
    YXE: "萨斯卡通",
    YWG: "温尼伯",
    YYZ: "多伦多",
    YOW: "渥太华",
    YUL: "蒙特利尔",
    YHZ: "哈利法克斯",

    // 美国 (USA)
    SEA: "西雅图",
    PDX: "波特兰",
    SFO: "旧金山",
    OAK: "奥克兰",
    SJC: "圣何塞",
    SMF: "萨克拉门托",
    LAX: "洛杉矶",
    SAN: "圣迭戈",
    LAS: "拉斯维加斯",
    PHX: "菲尼克斯",
    SLC: "盐湖城",
    DEN: "丹佛",
    ABQ: "阿尔伯克基",
    TUS: "图森",
    OKC: "俄克拉荷马城",
    DFW: "达拉斯",
    IAH: "休斯顿",
    AUS: "奥斯汀",
    SAT: "圣安东尼奥",
    MCI: "堪萨斯城",
    STL: "圣路易斯",
    MEM: "孟菲斯",
    MSY: "新奥尔良",
    BNA: "纳什维尔",
    ATL: "亚特兰大",
    JAX: "杰克逊维尔",
    MCO: "奥兰多",
    TPA: "坦帕",
    MIA: "迈阿密",
    CLT: "夏洛特",
    RDU: "罗利",
    IAD: "华盛顿杜勒斯",
    DCA: "华盛顿里根",
    BWI: "巴尔的摩",
    RIC: "里士满",
    ORF: "诺福克",
    PHL: "费城",
    JFK: "纽约肯尼迪",
    EWR: "纽瓦克",
    LGA: "纽约拉瓜迪亚",
    BOS: "波士顿",
    BUF: "布法罗",
    PIT: "匹兹堡",
    CLE: "克利夫兰",
    CVG: "辛辛那提",
    CMH: "哥伦布",
    IND: "印第安纳波利斯",
    DTW: "底特律",
    MKE: "密尔沃基",
    ORD: "芝加哥",
    MSP: "明尼阿波利斯",
    OMA: "奥马哈",
    FSD: "苏福尔斯",
    ANC: "安克雷奇",
    HNL: "檀香山",

    // 墨西哥 (Mexico)
    MEX: "墨西哥城",
    GDL: "瓜达拉哈拉",
    MTY: "蒙特雷",
    QRO: "克雷塔罗",

    // 危地马拉 (Guatemala)
    GUA: "危地马拉城",

    // 伯利兹 (Belize) - 暂无

    // 萨尔瓦多 (El Salvador) - 暂无

    // 洪都拉斯 (Honduras)
    SAP: "圣佩德罗苏拉",
    TGU: "特古西加尔巴",

    // 尼加拉瓜 (Nicaragua) - 暂无

    // 哥斯达黎加 (Costa Rica)
    SJO: "圣何塞",

    // 巴拿马 (Panama)
    PTY: "巴拿马城",

    // 加勒比地区
    GCM: "开曼群岛", // 开曼
    NAS: "拿骚", // 巴哈马
    KIN: "金斯敦", // 牙买加
    PAP: "太子港", // 海地
    SDQ: "圣多明各", // 多米尼加
    STI: "圣地亚哥", // 多米尼加
    SJU: "圣胡安", // 波多黎各
    BGI: "布里奇敦", // 巴巴多斯
    GND: "圣乔治", // 格林纳达
    MBJ: "蒙特哥贝", // 牙买加
    SXM: "圣马丁", // 荷属圣马丁
    UVF: "卡斯特里", // 圣卢西亚

    // ==================== 南美洲 ====================

    // 哥伦比亚 (Colombia)
    BOG: "波哥大",
    MDE: "麦德林",
    CLO: "卡利",
    BAQ: "巴兰基亚",

    // 委内瑞拉 (Venezuela)
    CCS: "加拉加斯",

    // 圭亚那 (Guyana)
    GEO: "乔治敦",

    // 苏里南 (Suriname)
    PBM: "帕拉马里博",

    // 厄瓜多尔 (Ecuador)
    UIO: "基多",
    GYE: "瓜亚基尔",

    // 秘鲁 (Peru)
    LIM: "利马",
    CUZ: "库斯科",

    // 玻利维亚 (Bolivia)
    LPB: "拉巴斯",
    VVI: "圣克鲁斯",

    // 巴西 (Brazil)
    GRU: "圣保罗",
    CGH: "圣保罗孔戈尼亚斯",
    VCP: "坎皮纳斯",
    GIG: "里约热内卢",
    BSB: "巴西利亚",
    CNF: "贝洛奥里藏特",
    CWB: "库里提巴",
    POA: "阿雷格里港",
    FLN: "弗洛里亚诺波利斯",
    SSA: "萨尔瓦多",
    REC: "累西腓",
    FOR: "福塔莱萨",
    BEL: "贝伦",
    MAO: "马瑙斯",
    GOI: "戈亚尼亚",
    UDI: "乌贝兰迪亚",
    CGB: "库亚巴",
    PMW: "帕尔马斯",
    JDO: "北茹阿泽鲁",
    RAO: "里贝朗普雷图",
    SJK: "圣若泽杜斯坎普斯",
    SJP: "圣若泽杜里奥普雷图",
    SOD: "索罗卡巴",
    ITJ: "伊塔雅伊",
    JOI: "若因维利",
    NVT: "廷博",
    CAW: "坎波斯",
    ARU: "阿拉萨图巴",
    CFC: "卡萨多尔",
    BNU: "布鲁梅瑙",
    XAP: "沙佩科",
    QWJ: "阿美利卡纳",

    // 巴拉圭 (Paraguay)
    ASU: "亚松森",

    // 乌拉圭 (Uruguay)
    MVD: "蒙得维的亚",

    // 阿根廷 (Argentina)
    EZE: "布宜诺斯艾利斯",
    AEP: "布宜诺斯艾利斯国内",
    COR: "科尔多瓦",
    NQN: "内乌肯",

    // 智利 (Chile)
    SCL: "圣地亚哥",
    ARI: "阿里卡",
    CCP: "康塞普西翁",

    // 福克兰群岛 - 暂无

    // ==================== 大洋洲 ====================

    // 澳大利亚 (Australia)
    PER: "珀斯",
    ADL: "阿德莱德",
    MEL: "墨尔本",
    SYD: "悉尼",
    CBR: "堪培拉",
    BNE: "布里斯班",
    HBA: "霍巴特",

    // 新西兰 (New Zealand)
    AKL: "奥克兰",
    WLG: "惠灵顿",
    CHC: "基督城",

    // 巴布亚新几内亚 (Papua New Guinea) - 暂无

    // 斐济 (Fiji)
    SUV: "苏瓦",
    NAN: "纳迪",

    // 新喀里多尼亚 (New Caledonia)
    NOU: "努美阿",

    // 法属波利尼西亚 (French Polynesia)
    PPT: "塔希提",

    // 关岛 (Guam)
    GUM: "哈加特纳",

    // 其他太平洋岛屿 - 暂无

    // ==================== 其他/备用 ====================
    LOCAL: "本地网络",
    "N/A": "未知",
  };

  /* =========================
           🎨 UI风格
  ========================= */

  GM_addStyle(`
    #cfpp{
      position:fixed;
      left:18px;
      bottom:${IS_MOBILE ? 92 : 130}px;

      width:${ICON_SIZE}px;
      height:${ICON_SIZE}px;

      border-radius:50%;

      background:
        linear-gradient(
          135deg,
          #ff9a3c,
          #f38020
        );

      display:flex;
      align-items:center;
      justify-content:center;

      z-index:999999;

      cursor:grab;
      user-select:none;
      -webkit-user-select:none;

      box-shadow:
        0 8px 22px rgba(0,0,0,.28);

      opacity: .3;
      transition:
        transform .18s ease,
        box-shadow .18s ease,
        opacity .18s ease;

      animation:cfpop .42s ease;

      touch-action:none;
      -webkit-tap-highlight-color: transparent;
    }

    #cfpp:hover{
      transform:scale(1.08);
      opacity: 1;
      box-shadow:
        0 14px 30px rgba(0,0,0,.32);
    }

    #cfpp.cfpp-panel-open{
      opacity: 1;
    }

    #cfpp.dragging{
      cursor:grabbing;
      transition:none;
      opacity:.92;
      transform:scale(1.06);
    }

    #cfpp svg{
      width:${IS_MOBILE ? 24 : 22}px;
      height:${IS_MOBILE ? 24 : 22}px;

      fill:#fff;
      pointer-events:none;
    }

    #cfpanel{
      position:fixed;

      display:none;

      min-width:${IS_MOBILE ? 230 : 210}px;
      max-width:min(${IS_MOBILE ? 92 : 340}px,calc(100vw - 16px));

      padding:${IS_MOBILE ? 16 : 14}px ${IS_MOBILE ? 16 : 15}px;

      border-radius:${IS_MOBILE ? 18 : 16}px;

      background:
        rgba(255,255,255,.84);

      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);

      border:
        1px solid rgba(255,255,255,.45);

      box-shadow:
        0 12px 38px rgba(0,0,0,.22);

      font-size:${IS_MOBILE ? 14 : 13}px;
      line-height:1.75;

      font-family:
        Inter,
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas;

      color:#111827;

      z-index:999998;

      user-select:none;
      -webkit-user-select:none;

      overflow-wrap:break-word;
      word-break:break-word;

      box-sizing:border-box;

      opacity:0;
      transform:translateY(4px) scale(.98);

      transition:
        opacity .18s ease,
        transform .18s ease;

      -webkit-tap-highlight-color: transparent;
    }

    #cfpanel.show{
      display:block;
      opacity:1;
      transform:translateY(0) scale(1);
    }

    .cf-title{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;

      margin-bottom:12px;

      color:#f38020;

      font-weight:700;
      font-size:${IS_MOBILE ? 15 : 14}px;

      white-space:nowrap;
      text-align:center;
    }

    .cf-row{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:4px;

      margin:7px 0;

      flex-wrap:wrap;

      text-align:center;
    }

    .cf-ok{
      color:#18a058;
      font-weight:700;
    }

    .cf-no{
      color:#ef4444;
      font-weight:700;
    }

    .cf-warn{
      color:#f59e0b;
      font-weight:700;
    }

    .cf-ip{
      cursor:pointer;

      display:inline;
      padding:0;
      margin:0;

      background:none;
      border:none;
      border-radius:0;

      transition: font-weight .12s ease;
      user-select: none;
      -webkit-user-select: none;
    }

    .cf-ip:hover{
      font-weight:600;
    }

    .cf-copy-ok{
      color:#18a058;
      font-weight:700;
    }

    .cf-loading{
      display:inline-flex;
      align-items:center;
      gap:8px;
    }

    .cf-loading::after{
      content:"";

      width:12px;
      height:12px;

      border-radius:50%;

      border:
        2px solid rgba(243,128,32,.22);

      border-top-color:#f38020;

      animation:
        cfspin .75s linear infinite;
    }

    @keyframes cfspin{
      to{
        transform:rotate(360deg);
      }
    }

    @keyframes cfpop{
      0%{
        transform:scale(.5);
        opacity:0;
      }

      100%{
        transform:scale(1);
        opacity:1;
      }
    }
  `);

  /* =========================
            辅助函数
  ========================= */

  function el(tag) {
    return document.createElement(tag);
  }

  function cacheGet() {
    try {
      let d = sessionStorage.getItem(CACHE_KEY);

      if (!d) return null;

      d = JSON.parse(d);

      if (Date.now() - d.t > CACHE_TTL) {
        return null;
      }

      return d.v;
    } catch {
      return null;
    }
  }

  function cacheSet(v) {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        t: Date.now(),
        v,
      }),
    );
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const input = document.createElement("textarea");

        input.value = text;

        document.body.appendChild(input);

        input.select();

        document.execCommand("copy");

        input.remove();

        return true;
      } catch {
        return false;
      }
    }
  }

  async function fetchTrace() {
    const timeout = 3000;
    const url = location.origin + "/cdn-cgi/trace";

    if (IS_MOBILE) {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
      }, timeout);
      try {
        const r = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!r.ok) {
          return "";
        }
        return await r.text();
      } catch {
        return "";
      } finally {
        clearTimeout(timer);
      }
    }
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout,

        headers: {
          "cache-control": "no-cache",
        },

        onload: (r) => resolve(r.responseText || ""),
        ontimeout: () => resolve(""),
        onerror: () => resolve(""),
      });
    });
  }

  /* =========================
             嗅探
  ========================= */

  async function detect() {
    const cached = cacheGet();

    if (cached) return cached;

    const data = {
      ip: "未知",
      colo: "未知",
      cf: false,
      trace: false,
    };

    try {
      const r = await fetch(location.href, {
        method: "HEAD",
        cache: "no-store",
      });

      const server = r.headers.get("server") || "";
      const cfRay = r.headers.get("cf-ray") || "";

      if (server.toLowerCase().includes("cloudflare") || cfRay) {
        data.cf = true;
      }
    } catch {}

    try {
      const text = await fetchTrace();

      if (text.includes("colo=")) {
        data.trace = true;

        const co = (text.match(/colo=([A-Z]+)/) || [])[1];

        data.colo = coloMap[co] ? `${coloMap[co]} (${co})` : co || "未知";

        const ip = (text.match(/ip=([^\n]+)/) || [])[1];

        if (ip) {
          data.ip = ip;
        }
      }
    } catch {}

    cacheSet(data);

    return data;
  }

  /* =========================
             状态
  ========================= */

  function getStatus(d) {
    if (!d.cf) {
      return {
        text: "无 Cloudflare",
        dot: "🔴",
        color: "cf-no",
      };
    }

    if (d.cf && d.trace) {
      return {
        text: "Cloudflare 正常",
        dot: "🟢",
        color: "cf-ok",
      };
    }

    return {
      text: "Cloudflare 已启用",
      dot: "🟡",
      color: "cf-warn",
    };
  }

  /* =========================
            面板位置
  ========================= */

  function updatePanelPosition(icon, panel) {
    requestAnimationFrame(() => {
      const iconRect = icon.getBoundingClientRect();

      const panelRect = panel.getBoundingClientRect();

      const winW = window.innerWidth;
      const winH = window.innerHeight;

      const centerX = iconRect.left + iconRect.width / 2;
      const centerY = iconRect.top + iconRect.height / 2;

      const isLeft = centerX < winW / 2;
      const isTop = centerY < winH / 2;

      let panelX;
      let panelY;

      if (IS_MOBILE) {
        panelX = Math.max(
          8,
          Math.min(centerX - panelRect.width / 2, winW - panelRect.width - 8),
        );

        if (isTop) {
          panelY = iconRect.bottom + PANEL_GAP;
        } else {
          panelY = iconRect.top - panelRect.height - PANEL_GAP;
        }
      } else {
        if (isLeft) {
          panelX = iconRect.left + ICON_SIZE + PANEL_GAP;
        } else {
          panelX = iconRect.left - panelRect.width - PANEL_GAP;
        }

        if (isTop) {
          panelY = iconRect.top;
        } else {
          panelY = iconRect.top + ICON_SIZE - panelRect.height;
        }
      }

      panelX = Math.max(8, Math.min(panelX, winW - panelRect.width - 8));

      panelY = Math.max(8, Math.min(panelY, winH - panelRect.height - 8));

      panel.style.left = panelX + "px";
      panel.style.top = panelY + "px";
      panel.style.bottom = "auto";
    });
  }

  /* =========================
             拖拽
  ========================= */

  function enableDrag(panel, icon) {
    let saved = null;

    try {
      saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
    } catch {}

    let currentX = 18;
    let currentY = window.innerHeight - 180;

    if (saved) {
      currentX = saved.x;
      currentY = saved.y;
    }

    function updateIconPosition(x, y) {
      const maxX = window.innerWidth - ICON_SIZE;
      const maxY = window.innerHeight - ICON_SIZE;

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      currentX = x;
      currentY = y;

      icon.style.left = x + "px";
      icon.style.top = y + "px";
      icon.style.bottom = "auto";

      updatePanelPosition(icon, panel);

      localStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
    }

    updateIconPosition(currentX, currentY);

    let dragging = false;
    let moved = false;

    let offsetX = 0;
    let offsetY = 0;

    let longPressTimer = null;

    function start(x, y) {
      dragging = true;
      moved = false;

      icon.classList.add("dragging");

      offsetX = x - currentX;
      offsetY = y - currentY;
    }

    function move(x, y) {
      if (!dragging) return;

      moved = true;

      updateIconPosition(x - offsetX, y - offsetY);
    }

    function end() {
      dragging = false;

      icon.classList.remove("dragging");

      clearTimeout(longPressTimer);
    }

    /* =========================
               电脑端
    ========================= */

    icon.addEventListener("mousedown", (e) => {
      start(e.clientX, e.clientY);

      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      move(e.clientX, e.clientY);
    });

    document.addEventListener("mouseup", end);

    /* =========================
               移动端
    ========================= */

    icon.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];

        moved = false;

        longPressTimer = setTimeout(() => {
          start(touch.clientX, touch.clientY);
        }, LONG_PRESS_TIME);
      },
      { passive: true },
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];

        if (!dragging) {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
          }

          return;
        }

        move(touch.clientX, touch.clientY);

        e.preventDefault();
      },
      { passive: false },
    );

    document.addEventListener("touchend", end);

    window.addEventListener("resize", () => {
      updateIconPosition(currentX, currentY);
    });

    return () => moved;
  }

  /* =========================
            初始化
  ========================= */

  function init() {
    const icon = el("div");
    icon.id = "cfpp";

    icon.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M17 10a5 5 0 0 0-10 1 4 4 0 0 0 0 8h10a3 3 0 0 0 0-6z"/>
      </svg>
    `;

    const panel = el("div");
    panel.id = "cfpanel";

    document.body.appendChild(icon);
    document.body.appendChild(panel);

    const hasMoved = enableDrag(panel, icon);

    let opened = false;
    let loading = false;

    async function togglePanel() {
      if (loading) return;

      opened = !opened;

      if (!opened) {
        icon.classList.remove("cfpp-panel-open");

        panel.classList.remove("show");

        setTimeout(() => {
          if (!opened) {
            panel.style.display = "none";
          }
        }, 180);

        return;
      }

      icon.classList.add("cfpp-panel-open");

      panel.style.display = "block";

      requestAnimationFrame(() => {
        panel.classList.add("show");
      });

      panel.innerHTML = `
        <div class="cf-title">
          ⏳ Cloudflare Detector
        </div>

        <div class="cf-row">
          <span class="cf-loading cf-warn">
            正在检测节点
          </span>
        </div>
      `;

      updatePanelPosition(icon, panel);

      loading = true;

      const d = await detect();

      loading = false;

      const st = getStatus(d);

      let info = "";

      if (d.cf) {
        if (d.trace) {
          info = `
            <div class="cf-row">
              节点： ${d.colo}
            </div>

            <div class="cf-row">
              <span
                class="cf-ip"
                id="cf-copy-ip"
              >
                IP： ${d.ip}
              </span>
            </div>
          `;
        } else {
          info = `
            <div class="cf-row">
              Trace 被禁用
            </div>
          `;
        }
      }

      panel.innerHTML = `
        <div class="cf-title">
          ${st.dot} Cloudflare Detector
        </div>

        <div class="cf-row">
          状态：
          <span class="${st.color}">
            ${st.text}
          </span>
        </div>

        ${info}
      `;

      updatePanelPosition(icon, panel);

      if (d.cf && d.trace) {
        const ipEl = document.getElementById("cf-copy-ip");

        ipEl?.addEventListener("click", async () => {
          const ok = await copy(d.ip);

          if (!ok) return;

          ipEl.innerHTML = '<span class="cf-copy-ok">IP： 已复制 ✓</span>';

          setTimeout(() => {
            ipEl.innerText = `IP： ${d.ip}`;
          }, 1200);
        });
      }
    }

    icon.addEventListener("click", () => {
      if (hasMoved()) return;

      togglePanel();
    });

    document.addEventListener("click", (e) => {
      if (opened && !panel.contains(e.target) && !icon.contains(e.target)) {
        opened = false;

        icon.classList.remove("cfpp-panel-open");

        panel.classList.remove("show");

        setTimeout(() => {
          if (!opened) {
            panel.style.display = "none";
          }
        }, 180);
      }
    });
  }

  init();
})();
