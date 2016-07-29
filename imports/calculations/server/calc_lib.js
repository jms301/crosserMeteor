export function create_calc(schemeId, histId, userId) {

	return Calculations.insert( {
		schemeId:  schemeId,
		historyId: histId,
		userId: userId,
		queueTime: new Date(),

		startTime: null,
		endTime: null,

		crossStdOut: "",
		crossStdErr: "",
		rStdOut: "",
		rStdErr: "",
		crossExit: null,
		rExit: null
	});
}
