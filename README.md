# jQuery-Form
  jQuery-Form 工具为简化表单操作而产生, 意在做到一步获取易管理的表单数据, 轻松配置表单验证和数据回填功能.
  
# 将`jQuery-Form`导入到项目中
  * `下载`项目到本地
  * 解压后提取3个文件:`Form.js`, `StringUtil.js`, `prototype.js`
  * 依次页面应用顺序:
    * jQuery库: jQuery 1.8+
    * 原型扩展:`prototype.js`
    * 字符串工具:`StringUtil.js`
    * 表单工具:`Form.js`
# 如何使用
  表单容器不强制性依赖`form`控件, 表单容器可以是任意控件元素.<br>
  但应确保表单容器中包含合法(name属性值)的表单项控件, 如: `input`,`select`,`textarea`.<br>
  * 获取表单对象
    ```c
    var formContainerSelector = 'div#form-container form:eq(0)';
    // 表单容器选择器除了可以直接指向form控件之外, 也可以使用其父容器.
    // 但应确保容器中只存在一个表单对象
    // formContainerSelector = 'div#form-container';
    var form = new From(formContainerSelector);
    ```
  * 获取表单数据
    ```c
    // 获取表单数据调用getData函数
    var formData = form.getData();
    ```
    该函数不接受任何参数, 其返回值是Object对象. 对象中仅包含一级属性.<br>
    可使用`for-in`迭代出所有属性, 且属性名总是与表单项的`name属性值`对应.<br>
    如果表单项可接受多个值, 对应的表单值将使用`Array`对象保存, 相关控件包括: `input[type='checkbox']`,`select[multiple='multiple']`.<br>
    ```c
    // (checkboxValues instanceof Array) -- true
    var checkboxValues = formData['hobbies'];
    ```
  * 表单验证
  
# 依赖工具
