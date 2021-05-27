var selectData = {}; //用来存储所有的商品信息以及商品
function init() {
    selectData = JSON.parse(localStorage.getItem('shoppingCart')) || {};
    createDom();
}
init();
//请求数据
$.ajax({
        url: "https://lihaibo-li.github.io/shopping/js/shoppingData.json",
        type: "get",
        datatype: "json",
        success: function(data) {
            createGoodsDom(data);
            addEvent();
        }
    })
    //创建商品结构
function createGoodsDom(data) {
    var str = '';
    data.forEach(function(ele) {
        var color = '';
        ele.list.forEach(function(item) {
            color += '<span data-id=' + item.id + '>' + item.color + '</span>'
        })
        str += '<tr>' +
            '<td>' +
            '<img src="' + ele.list[0].img + '" alt="">' +
            '</td>' +
            '<td>' +
            '<p>' + ele.name + '</p>' +
            '<div class="color">' + color + '</div>' +
            '</td>' +
            '<td>' + ele.list[0].price + '.00元</td>' +
            '<td>' +
            '<span>-</span>' +
            '<strong>0</strong>' +
            '<span>+</span>' +
            '</td>' +
            '<td>' +
            '<button>加入购物车</button>' +
            '</td>' +
            '</tr>'
    })
    var tbody = document.getElementsByTagName('tbody')[0];
    tbody.innerHTML = str;
}
// 添加商品操作事件
function addEvent() {
    var trs = document.querySelectorAll('.product tr');
    for (var i = 0; i < trs.length; i++) {
        action(trs[i], i)
    }

    function action(tr, n) {
        var tds = tr.children, //行里所有的td元素
            img = tds[0].children[0], //拿到所有行里的img
            imgSrc = img.getAttribute('src'), //拿到每一行里面的img上的src属性
            pName = tds[1].children[0].innerHTML, //拿到每一个行里面的p标签的文本
            colors = tds[1].children[1].children, //拿到所有的颜色span标签
            price = parseFloat(tds[2].innerHTML), //拿到每一行里面的价格
            span = tds[3].querySelectorAll('span'), //拿到每一行里面的加减号
            strong = tds[3].querySelector('strong'), //拿到每一行里面的strong标签
            btn = tds[4].children, //拿到每一行里面的button标签
            selectNum = 0 //这是strong里面的数字

        //颜色按钮点击功能
        var last = null, //上一次点击的按钮
            colorValue = '', //选中的颜色
            colorId = '' //选中商品对应的id
        for (var i = 0; i < colors.length; i++) {
            colors[i].index = i; //添加一个自定义的索引属性
            colors[i].onclick = function() {
                last && last != this && (last.className = '');
                this.className = this.className ? '' : 'action';
                colorValue = this.className ? this.innerHTML : '';
                colorId = this.className ? this.dataset.id : '';
                imgSrc = this.className ? './img/img-0' + (n + 1) + '-0' + (this.index + 1) + '.png' : './img/img-0' + (n + 1) + '-01.png';
                img.src = imgSrc;
                last = this;
            }
        }
        //减按钮点击
        span[0].onclick = function() {
                selectNum--;
                if (selectNum < 0) {
                    selectNum = 0;
                }
                strong.innerHTML = selectNum;
            }
            //加按钮点击
        span[1].onclick = function() {
            selectNum++;
            strong.innerHTML = selectNum;
        }

        //加入购物车
        btn[0].onclick = function() {
            if (!colorValue) {
                alert('请选择商品颜色');
                return;
            }
            if (!selectNum) {
                alert('请添加购买数量');
                return;
            }


            //给selectData 复制
            selectData[colorId] = {
                    "Id": colorId,
                    "name": pName,
                    "color": colorValue,
                    "price": price,
                    "num": selectNum,
                    "img": imgSrc,
                    "time": new Date().getTime()
                }
                //持久存储
            localStorage.setItem('shoppingCart', JSON.stringify(selectData));

            //加入购物车后让所有已经选择的内容还原
            img.src = './img/img-0' + (n + 1) + '-01.png';
            last.className = '';
            strong.innerHTML = selectNum = 0;
            createDom(); //存储完数据后要渲染购物车的结构
        }
    }
}

//创建购物车商品结构
function createDom() {
    var tbody = document.querySelector('.selected tbody');
    var totalPrice = document.querySelector('.selected strong');
    var str = '',
        total = 0; //总共多少钱
    var goods = Object.values(selectData); //Es7里面的方法  可以取到对象里面所有的value 并把value放到一个数组里
    goods.sort(function(g1, g2) {
        return g2.time - g1.time;
    });
    tbody.innerHTML = '';
    for (var i = 0; i < goods.length; i++) {
        str += '<tr>' +
            '<td>' +
            '<img src=' + goods[i].img + ' alt="">' +
            '</td>' +
            '<td>' +
            '<p>' + goods[i].name + '</p>' +
            '</td>' +
            '<td>' + goods[i].color + '</td>' +
            '<td>' + goods[i].price * goods[i].num + '.00元</td>' +
            '<td>' + goods[i].num + '</td>' +
            '<td><button data-id=' + goods[i].Id + '>删除</button></td>' +
            '</tr>';
        total += goods[i].price * goods[i].num;
    }
    tbody.innerHTML = str;
    totalPrice.innerHTML = total + '.00元';
    del(); //结构创建完成了  添加删除功能
}
//删除功能
function del() {
    var btns = document.querySelectorAll('.selected button');
    var tby = document.querySelector('.selected tbody');
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function() {
            //删除对象里面的数据
            delete selectData[this.dataset.id];
            localStorage.setItem('shoppingCart', JSON.stringify(selectData));
            //删除dom结构
            tby.removeChild(this.parentNode.parentNode);
            //更新总价钱
            var totalPri = document.querySelector('.selected strong');
            totalPri.innerHTML = parseFloat(totalPri.innerHTML) - parseFloat(this.parentNode.parentNode.children[3].innerHTML) + '.00元';
        }
    }
}
//storage事件
window.addEventListener('storage', function(ev) {
    // console.log(ev.key) //修改的是哪一个localStrage (key名)
    // console.log(ev.newValue) //修改后的数据
    // console.log(ev.oldValue) //修改前的数据
    // console.log(ev.storageArea) //storage对象
    // console.log(ev.url) //返回操作的那个页面的url
    init();
}, false)