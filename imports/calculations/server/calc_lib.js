export function create_calc(name, schemeId, histId, userId) {

	return Calculations.insert( {
    name: name,
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
