four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User',
function ($scope, $routeParams, $location, $451, Order, OrderConfig, User) {
	var isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if (isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
		});
	}

	$scope.currentDate = new Date();
	$scope.errorMessage = null;
	$scope.continueShopping = function() {
		if (!$scope.cart.$invalid) {
			if (confirm('Do you want to save changes to your order before continuing?') == true)
				$scope.saveChanges(function() { $location.path('catalog') });
		}
		else
			$location.path('catalog');
	};

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') == true) {
			$scope.displayLoadingIndicator = true;
			$scope.actionMessage = null;
			Order.delete($scope.currentOrder,
				function(){
					$scope.currentOrder = null;
					$scope.user.CurrentOrderID = null;
					User.save($scope.user, function(){
						$location.path('catalog');
					});
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved!';
				},
				function(ex) {
					$scope.actionMessage = 'An error occurred: ' + ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.saveChanges = function(callback) {
		$scope.actionMessage = null;
		$scope.errorMessage = null;
		if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
			$scope.cancelOrder();
		}
		else {
			$scope.displayLoadingIndicator = true;
			OrderConfig.address($scope.currentOrder, $scope.user);
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					$scope.displayLoadingIndicator = false;
					if (callback) callback();
					$scope.actionMessage = 'Your Changes Have Been Saved!';
				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.removeItem = function(item) {
		if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
			Order.deletelineitem($scope.currentOrder.ID, item.ID,
				function(order) {
					$scope.currentOrder = order;
					Order.clearshipping($scope.currentOrder);
					if (!order) {
						$scope.user.CurrentOrderID = null;
						User.save($scope.user, function(){
							$location.path('catalog');
						});
					}
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved!';
				},
				function (ex) {
					$scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	}

	$scope.checkOut = function() {
		$scope.displayLoadingIndicator = true;
		if (!isEditforApproval)
			OrderConfig.address($scope.currentOrder, $scope.user);
		Order.save($scope.currentOrder,
			function(data) {
				$scope.currentOrder = data;
				$location.path(isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
				$scope.displayLoadingIndicator = false;
			},
			function(ex) {
				$scope.errorMessage = ex.Message;
				$scope.displayLoadingIndicator = false;
			}
		);
	};

	$scope.$watch('currentOrder.LineItems', function(newval) {
		var newTotal = 0;
		if (!$scope.currentOrder) return newTotal;
		angular.forEach($scope.currentOrder.LineItems, function(item){
			newTotal += item.LineTotal;
		});
		$scope.currentOrder.Subtotal = newTotal;
	}, true);

	$scope.copyAddressToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;
		});
	};

	$scope.copyCostCenterToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
		});
	};

	$scope.onPrint = function()  {
		window.print();
	};

	$scope.cancelEdit = function() {
		$location.path('order');
	};
}]);