import HomePage from '../pages/home.f7.html';
import ChatList from '../pages/chatlist.f7.html';
import ChatPage from '../pages/chat.f7.html';
import PersonalPage from '../pages/personal.f7.html';

window.ChatList = ChatList;
window.ChatPage = ChatPage;
window.PersonalPage = PersonalPage;

var routes=[
	{
		path: '/',
		component: HomePage,
		keepAlive: true,
	},
	{
	  path: '/catalogcat/:id/',
	  asyncComponent: () => import('../pages/catalogcat.f7.html'),
	},
	{
	  path: '/goodslist/:id/',
	  asyncComponent: () => import('../pages/goodslist.f7.html'),
	},
	{
		path: '/chat/:id/',
		component: ChatPage,
	},
	{
		path: '/chatlist/',
		component: ChatList,
		name: "chatlist"
	},
	{
	  path: '/search/',
	  asyncComponent: () => import('../pages/search.f7.html'),
	},
	{
	  path: '/login/',
	  asyncComponent: () => import('../pages/login.f7.html'),
	},
	{
		path: '/personal/',
		component: PersonalPage,
	},
	{
	  path: '/order/',
	  asyncComponent: () => import('../pages/order.f7.html'),
	},
	{
	  path: '/orders/',
	  asyncComponent: () => import('../pages/orders.f7.html'),
	},
	{
	  path: '/newsdetail/:id/',
	  asyncComponent: () => import('../pages/newsdetail.f7.html'),
	},
	{
	  path: '/map/:id/',
	  asyncComponent: () => import('../pages/map.f7.html'),
	},		
	{
		path: '/cart/',
		asyncComponent: () => import('../pages/cart.f7.html'),
	},
	{
		path: '/info/:id/',
		asyncComponent: () => import('../pages/info.f7.html'),
	},
	{
		path: '/fanks/:id/',
		asyncComponent: () => import('../pages/fanks.f7.html'),
	},
];
export default routes;