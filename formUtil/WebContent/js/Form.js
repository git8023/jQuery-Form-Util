if (typeof jQuery === "undefined") { throw Error("jquery-form requires jQuery"); }

/**
 * @Description 表单对象
 * @param formContainer
 *            {Element|jQuery} 表单控件, 可以是任意控件(DIV, P, FORM, ...等等), 只要包含
 *            SELECT|INPUT|TEXTAREA 元素且合法即可(表单元素必须包含<b>NAME</b>属性).
 * @param debug
 *            {Boolean} true-打印调试日志
 * @Usage 获取实例对象: var form = new Form(el, showLog);
 *        <ul>
 *        <li>基于正则表达式的表单验证</li>
 *        <li>获取表单数据</li>
 *        <li>表单回填</li>
 *        <li>通过内置函数提交表单</li>
 *        </ul>
 * @returns {Form} 表单对象实体
 * @author Huong.Yong
 */
function Form(formContainer, debug) {
    if (!formContainer) throw Error("Missing target form container");

    var EMPTY_STRING = "";

    /** 等待远程响应列队数量 */
    var remotePendingCount = 0;

    var $thisObj = this;

    /** true-开启调试模式 */
    $thisObj.debug = !(!(debug)) || false;

    /** 表单容器 */
    $thisObj.container = $(formContainer);

    /** 表单项 */
    $thisObj.formItems = {
        singleValItems: null,
        repeatableItems: null,
        isEmpty: function() {
            var emptySingleItems = (this.singleValItems && this.singleValItems.size());
            var emptyRepeatItems = (this.repeatableItems && this.repeatableItems.size());
            return !(emptySingleItems && emptyRepeatItems);
        },
        _summary: "表单项缓存列表"
    };

    /** 关键字 */
    var KEYS = $thisObj.KEYS = {
        validate: {
            EVENTS: {
                validSuccess: "validSuccess",
                validFailed: "validFailed",
                validCompleted: "validCompleted",
                _summary: "验证回调事件关键字"
            },
            ATTIBUTES: {
                REGEXP: "regexp",
                REGEXP_ERROR: "regexp-error",

                EQULAS_TO: "eq-to",
                EQULAS_TO_ERROR: "eq-to-error",

                NOT_EQULAS_TO: "not-eq-to",
                NOT_EQULAS_TO_ERROR: "not-eq-to-error",

                REMOTE_URL: "remote-url",
                REMOTE_ERROR: "remote-error",

                _summary: "表单项可配置验证属性"
            }
        },
        _summary: "关键字字典"
    };

    /** 配置 */
    var config = $thisObj.config = {
        selectors: {
            singleSelectors: ["INPUT[name][type!='checkbox'][type!='radio'][type!='button']",
                    "INPUT:checked[name][type='radio']", "SELECT[name]", "TEXTAREA[name]"],
            repeatableSelectors: ["INPUT[name][type='checkbox']"],
            _summary: "表单项选择器"
        },

        dataHandlers: {
            date: function(item, value, pattern) {
                // isNaN(value) -> Format
                // else -> Parse
                alert("Please waiting implements...");
            },

            _summary: "数据处理器"
        },

        // TODO Validators
        validators: {
            doRegex: function(item, regexp) {
                log("Do regex.");
                // 获取配置
                var regexp, regexAttr = KEYS.validate.ATTIBUTES.REGEXP, regexpStr = item.attr(regexAttr);
                if (!regexpStr) return;

                // 配置项验证
                regexp = eval("(" + regexpStr + ")");
                log("regexp[" + regexp + "].");
                if (!(regexp instanceof RegExp)) {
                    log("Invalid [" + regexAttr + "] configure[" + regexpStr + "].");
                    return false;
                }

                // 正则表达式验证
                var val = item.val(), errMsg = item.attr(KEYS.validate.ATTIBUTES.REGEXP_ERROR);
                var valid = regexp.test(val);
                $thisObj.config.events.validate._invoke(item, valid, errMsg);

                return valid;
            },
            doEqTo: function(item) {
                log("Do equals to.");
                // 获取配置
                var equlasToAttr = KEYS.validate.ATTIBUTES.EQULAS_TO, eqToSelector = item.attr(equlasToAttr);
                if (undefined == eqToSelector || !eqToSelector) return;

                // 执行 Equals To 验证
                log("Target control selector[" + equlasToAttr + "].");
                var targetCtrl = $(eqToSelector), targetVal = targetCtrl.val();
                var val = item.val(), errMsg = item.attr(KEYS.validate.ATTIBUTES.EQULAS_TO_ERROR);
                var valid = (val == targetVal);
                $thisObj.config.events.validate._invoke(item, valid, errMsg);

                return valid;
            },
            doNotEqTo: function(item) {
                log("Do Not Equals To.");
                // 获取配置项
                var notEqulasToAttr = KEYS.validate.ATTIBUTES.NOT_EQULAS_TO;
                var notEqToSelector = item.attr(notEqulasToAttr);
                if (undefined == notEqToSelector || !notEqToSelector) return;

                // 执行验证
                log("Target control selector[" + notEqToSelector + "].");
                var targetCtrl = $(notEqToSelector), targetVal = targetCtrl.val();
                var val = item.val(), errMsg = item.attr(KEYS.validate.ATTIBUTES.NOT_EQULAS_TO_ERROR);
                var valid = (val != targetVal);
                $thisObj.config.events.validate._invoke(item, valid, errMsg);

                return valid;
            },
            doRemote: function(item) {
                log("Do remote varification.");

                // 获取remote-url
                var url = item.attr(KEYS.validate.ATTIBUTES.REMOTE_URL);
                if (stringUtil.isEmpty(url, true)) return undefined;

                // TODO remote等待计数+1
                remotePendingCount++;

                // 发送请求, 响应 成功|失败 remote等待计数-1
                var name = item.attr("name"), value = item.val();
                var param = {};
                param[name] = value;
                $.ajax({
                    url: stringUtil.getRealUrl(url),
                    data: param,
                    async: false,
                    success: function(rData) {
                        remotePendingCount--;
                        console.log("Remote verified result: >>"
                                        + (typeof rData == "object" ? JSON.stringify(rData) : rData) + ".");

                        // 尝试将返回结果处理为非字符串类型
                        try {
                            rData = eval("(" + rData + ")");
                        } catch (ignore) {
                        }

                        // 优先执行客户远程结果处理器
                        if ($thisObj.config.events.validate.remoteHandler instanceof Function) {
                            $thisObj.config.events.validate.remoteHandler(item, rData);
                            return;
                        }

                        // 执行默认处理器
                        var errMsg = item.attr(KEYS.validate.ATTIBUTES.REMOTE_ERROR);
                        $thisObj.config.events.validate._invoke(item, rData, errMsg);
                    },
                    error: function(rData) {
                        remotePendingCount--;
                        // TODO 按失败处理
                        console.log("error, remotePendingCount:" + remotePendingCount);
                    }
                });
            },

            // 执行指定验证器
            invoke: function(item) {
                item = $(item);
                var result = true, tmp;

                // 获取验证器类型
                // 可以叠加验证, 其中一个验证失败, 返回false; 否则继续验证, 直到调用完所有验证, 返回结果;
                // :> Regexp
                tmp = this.doRegex(item);
                result = (undefined != tmp ? (tmp && result) : result);

                // :> eqTo
                if (result) {
                    tmp = this.doEqTo(item);
                    result = (undefined != tmp ? (tmp && result) : result);
                }

                // :> notEqTo
                if (result) {
                    tmp = this.doNotEqTo(item);
                    result = (undefined != tmp ? (tmp && result) : result);
                }

                // :> remote
                // FIXME 暂不实现远程验证
                if (result) {
                    tmp = this.doRemote(item);
                    result = (undefined != tmp ? (tmp && result) : result);
                }

                return result;
            },

            _summary: "验证器列表"
        },

        // 事件配置
        events: {
            validate: {
                validSuccess: null,
                validFailed: null,
                validCompleted: null,
                remoteHandler: null,
                _invoke: function(item, valid, errMsg) {
                    if (undefined == item && undefined == valid) {
                        var result = this.validCompleted.apply($thisObj);
                    }

                    var val = item.val();
                    if (!(!valid)) {
                        return this.validSuccess.call($thisObj, item, val);
                    } else {
                        return this.validFailed.call($thisObj, item, val, errMsg);
                    }
                },
                _repair: function() {
                    for ( var k in this) {
                        if (/$valid/.test(k) && !(this[k] instanceof Function)) {
                            this[k] = createEmptyFn();
                        }
                    }
                },
                _summary: "验证回调函数列表"
            },

            _summary: "事件列表"
        },

        _summary: "配置列表"
    };

    // 创建空函数
    function createEmptyFn() {
        return function() {
        };
    }

    /**
     * 获取表单数据
     * 
     * @param refreshCached
     *            {Boolean} true-使用缓存的表单项, false-刷新表单项缓存
     * @returns {JSON} 表单数据
     */
    this.getData = function(refreshCached) {
        refreshCached = !(!refreshCached)
        log("Get form data.");
        $thisObj.getFormItems(refreshCached);

        var data = {};
        // Single value
        log("Set single values.");
        $thisObj.formItems.singleValItems.each(function() {
            var $this = $(this), name = ($this.attr("name") || EMPTY_STRING).trim();
            if (!name) return true;
            data[name] = $this.val();
        });

        // Array value
        log("Set repeat value.");
        $thisObj.formItems.repeatableItems.each(function() {
            var $this = $(this), val = $this.val(), name = ($this.attr("name") || EMPTY_STRING).trim();
            log("Form contorl [name='" + name + "'][value='" + val + "'].");

            if (!name) {
                log("Skip invalid form control.");
                return true;
            }

            if ("INPUT" == $this[0].tagName && "checkbox" == $this.attr("type")) {
                log("This is 'checkbox' input control.");
                var choseCheckbox = $this.is(":checked");
                if (!choseCheckbox) {
                    log("Skip unchecked item");
                    return true;
                }
            }

            var oldVal = data[name];
            if (oldVal instanceof Array) {
                data[name].push(val);
            } else {
                data[name] = [val];
                oldVal && data[name].push(oldVal);
            }
        });
        log("show data:");

        log(data);
        return data;
    }

    /**
     * 获取表单项, 表单项包含的控件请查阅 <b>Form.prototype.config.selectors.singleSelectors</b>
     * 
     * @param refreshCached
     *            {Boolean} true-使用缓存的表单项, false-重新获取表单项(<i>表单结构有变动时使用</i>)
     * @returns {jQuery} 表单项列表
     */
    this.getFormItems = function(refreshCached) {
        log("Get form controls[refreshCached='" + refreshCached + "'].");
        if ($thisObj.formItems.isEmpty() || refreshCached) {
            log("Refresh chached from controls.");

            var singleValSelectors = $thisObj.config.selectors.singleSelectors.toString();
            $thisObj.formItems.singleValItems = $thisObj.container.find(singleValSelectors);
            log("Single value controls size of : " + $thisObj.formItems.singleValItems.size() + ".");

            var repeatableValSelectors = $thisObj.config.selectors.repeatableSelectors.toString();
            $thisObj.formItems.repeatableItems = $thisObj.container.find(repeatableValSelectors);
            log("Repeatable value controls size of : " + $thisObj.formItems.repeatableItems.size() + ".");
        }

        return $thisObj.formItems;
    }

    /**
     * 表单验证
     * 
     * @param conf
     *            {Object} 验证配置, 以下是<i>conf</i>属性列表: <br>
     *            <p>
     *            <b>refreshCached</b> - {Boolean} (Default:false) 刷新表单项缓存
     *            表单项列表或存在影响验证结果的变动时, 应指定为 true<br>
     *            <b>validAll</b> - {Boolean} (Default:false) true-总是验证所有表单项,
     *            false-遇到验证失败时停止验证. <b>远程验证与此配置无关</b><br>
     *            <br>
     *            以下验证结果处理器会覆盖({@link new Form().registerEvents()})已经注册的验证结果处理器<br>
     *            <b>validSuccess</b> - {Function} 验证通过回调函数. 参数:{item, value}<br>
     *            <b>validFailed</b> - {Function} 验证失败回调函数. 参数:{item, value,
     *            errMsg(表单项的regex属性值)}<br>
     *            <b>remoteHandler</b> - {Function} 验证失败回调函数, 参数: {item, value,
     *            errMsg} <br>
     *            <b>validCompleted</b> - {Function} 验证完成后回调函数.
     *            参数:{validResult}<br>
     *            </p>
     * @returns {Boolean} true-验证通过, false-验证失败, undefined-丢失结果处理器(不执行验证)
     */
    this.validate = function(conf) {
        log("Form validation. Invoke configure:");
        log(conf);
        conf = (conf || {});
        var validResult = undefined;

        // 验证事件列表是否配置正确
        log("Set callbacks: validSuccess, validFailed, validCompleted");
        $thisObj.registerEvents(conf);
        if (!hasValidationHandler()) {
            log("Can't found any callbacks. Skip the verification.");
            return validResult;
        }

        // 获取表单项列表
        log("Get form controls.");
        if (conf["refreshCached"]) {
            $thisObj.getFormItems(true);
        }

        log("Get the form controls list and order structure.");
        var groupItems = getNamedFormControl();

        // 过滤暂时不支持的项: input[type='radio'], input[type='checkbox'], select
        if (!(groupItems && groupItems.length)) {
            log("Can't found form control, skip verification.");
            return validResult;
        } else {
            log("Filtering unsuport form controls: input[type='radio'], input[type='checkbox'], select.");
            var filteredArr = groupItems.filter(function(item) {
                var tagName = item[0].tagName;
                if ("SELECT".equals(tagName, true, true)) {
                    return false;
                } else if ("INPUT".equals(tagName, true, true)) {
                    var iptType = item.attr("type");
                    return (-1 == ["radio", "checkbox", "button"].indexOf(iptType));
                } else {
                    return true;
                }
            });
            log("Filtered tag size: " + filteredArr.length + ".");
        }

        log("Validate start.");
        validResult = true;
        groupItems.each(function(item, idx) {
            log("Current form control name: " + item.attr("name") + ".");
            validResult = ($thisObj.config.validators.invoke(item) && validResult);
            if (!(conf["validAll"] || validResult)) return false;
        });

        // 调用 validCompleted
        log("Callback validCompleted.");
        var validCompleted = $thisObj.config.events.validate.validCompleted;
        if (validCompleted instanceof Function) {
            validCompleted.call($thisObj, validResult);
        }

        // 返回校验结果
        log("Validate result: " + validResult + ".");
        return validResult;
    }

    // 检测是否已配置验证结果处理器
    function hasValidationHandler() {
        var hasValidSuccess = (config.events.validate.validSuccess instanceof Function);
        var validFailed = (config.events.validate.validFailed instanceof Function);
        var validCompleted = (config.events.validate.validCompleted instanceof Function);
        config.events.validate._repair();

        if (!(hasValidSuccess || validFailed || validCompleted)) {
            log("Can't found any callbacks. Skip the verification.");
            return false;
        } else {
            return true;
        }
    }

    // 获取表单控件(按控件在表单中的顺序)
    function getNamedFormControl() {
        var namedCtrls = [];
        $thisObj.container.find("[name]").each(function() {
            namedCtrls.push($(this));
        });
        return namedCtrls;
    }

    // 校验指定对象是否 Function
    function isFn(obj) {
        return (obj && (obj instanceof Function));
    }

    /**
     * 事件注册
     * 
     * @param events
     *            {Object} 事件列表
     * 
     * <pre>
     * validSuccess     : {Function} 验证成功回调函数, 参数: {item, value}
     * validFailed      : {Function} 验证失败回调函数, 参数: {item, value, errMsg}
     * remoteHandler    : {Function} 验证失败回调函数, 参数: {item, value, errMsg}
     * validCompleted   : {Function} 验证完成回调函数
     * </pre>
     */
    this.registerEvents = function(events) {
        events = (events || {});
        setValidEvents("validSuccess", events["validSuccess"]);
        setValidEvents("validFailed", events["validFailed"]);
        setValidEvents("validCompleted", events["validCompleted"]);
        setValidEvents("remoteHandler", events["remoteHandler"]);
    }

    // TODO 事件设置
    function setValidEvents(eventName, eventFn) {
        if (eventFn instanceof Function) {
            config.events.validate[eventName] = eventFn;
        }
    }

    // TODO 表单提交

    function log(msg) {
        $thisObj.debug && window.console && console.log(msg);
    }
}
