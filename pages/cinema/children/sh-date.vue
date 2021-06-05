<template>
	<view>
		<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
			<view class="cu-item" :class="index==TabCur?'text-orange cur':''" v-for="(item,index) in detail" :key="index" @tap="tabSelect" :data-id="index">
				<text>{{item.week}} {{item.date}}</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import tools from '@/common/utils/tools'
export default {
	components: {},
	data() {
		return {
			TabCur: 0,
			detail: [],
			scrollLeft: 0
		};
	},
	methods: {
		tabSelect(e) {
			this.TabCur = e.currentTarget.dataset.id;
			this.$emit('subClickFtn',{day: this.detail[this.TabCur].day})
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
		},
		getDateList(){
			this.TabCur = 0
			this.scrollLeft = 0
			let date =new Date()
			let that = this
			let year=date.getFullYear();
			let month=date.getMonth()+1;
			/* let lastDay=new Date(year,month,0).getDate() */
			let lastDay=15
			let arr=[]
			for(let i = 0;i<lastDay;i++){
				let obj = tools.getDayList('',i)
				that.movieDates.forEach((item,index)=>{
					if(item == obj.day){
						if(i==0){
							obj.week = '今天'
							arr.push(obj)
						}else if(i==1){
							obj.week = '明天'
							arr.push(obj)
						}else if(i==2){
							obj.week = '后天'
							arr.push(obj)
						}else{
							arr.push(obj)
						}
					}
					
				})
			}
			this.detail = arr
		}
	},
	props: {
		movieDates: {
			type: Array,
			default: []
		}
	},
	created(){ 
		
	},
	computed: {},
	
};
</script>

<style scoped lang="scss">
	
</style>
