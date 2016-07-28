export function create_calc(schemeId, histId, userId) {

	Calculations.insert( {
		schemeId:  schemeId,
		historyId: histId,
		user_id: this.userId,
		queueTime: new Date(),
		startTime: null,
		endTime: null,
		console: "",
		errors: "",
		cross_result: null,
		r_result: null
	});
}
