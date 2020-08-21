<?php
class Server {
	private $host = "127.0.0.1";
	private $username;
	private $password;
	private $db_name;
	private $mysqli;
	private $data = [];
	public function __construct($username, $password, $db_name = ''){
		$this->username = $username;
		$this->password = $password;
		$this->db_name = $db_name;
	}
	private function connect(){
		if(empty($this->db_name)){
			$this->mysqli = @new mysqli($this->host, $this->username, $this->password);
		}else{
			$this->mysqli = @new mysqli($this->host, $this->username, $this->password, $this->db_name);
		}
		if($this->mysqli->connect_error){
			return false;
		}else{
			return true;
		}
	}
	private function disconnect(){
		@$this->mysqli->close();
		header("Content-Type: Application/json");
		echo json_encode($this->data);
	}
	public function show_databases(){
		if($this->connect()){
			$result = $this->mysqli->query("SHOW DATABASES");
			if($result->num_rows > 0){
				$this->data = [
					'type' => 'success',
					'data' => array_map(function($el){
						return $el[0];
					}, $result->fetch_all()),
				];
			}else{
				$this->data = [
					'type' => 'error',
					'data' => 'Could not find database',
				];
			}
		}else{
			$this->data = [
				'type' => 'error',
				'data' => 'Could not connect',
			];
		}
		$this->disconnect();
	}
	public function show_tables(){
		if($this->connect()){
			$result = $this->mysqli->query("SHOW TABLES");
			if($result->num_rows > 0){
				$this->data = [
					'type' => 'success',
					'data' => array_map(function($el){
						return $el[0];
					}, $result->fetch_all()),
				];
			}else{
				$this->data = [
					'type' => 'error',
					'data' => 'Could not find any table',
				];
			}
		}else{
			$this->data = [
				'type' => 'error',
				'data' => 'Could not connect',
			];
		}
		$this->disconnect();
	}

	private function get_indexes($table_name){
		$result = $this->mysqli->query("SHOW INDEX FROM $table_name FROM $this->db_name");
		if($result->num_rows > 0){
			$indexes = [];
			foreach($result->fetch_all(MYSQLI_ASSOC) as $index){
				if(array_key_exists($index["Key_name"], $indexes)){
					$indexes[$index["Key_name"]]["Column_name"][] = $index["Column_name"];
				}else{
					$indexes[$index["Key_name"]] = [
						'Key_name' => $index['Key_name'],
						'Unique' => ($index['Non_unique'] == 0)?'Yes':'No',
						'Column_name' => [$index['Column_name']],
						'Null' => $index['Null'],
						'Index_type' => $index['Index_type']
					];
				}
			}
			return array_values(array_map(function($el){
				return [
					'Key_name' => $el['Key_name'],
					'Column_names' => implode(', ', $el['Column_name']),
					'Index_type' => $el['Index_type'],
					'Unique' => $el['Unique'],
					'Null' => $el['Null']
				];
			}, $indexes));
		}else{
			return '';
		}
	}

	private function get_foreign_keys($table_name){
		$ret = ['pull_from' => '', 'push_to' => ''];
		$result = $this->mysqli->query("SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = '$this->db_name' AND REFERENCED_TABLE_NAME = '$table_name'");
		if($result->num_rows > 0){
			$ret['push_to'] = $result->fetch_all(MYSQLI_ASSOC);
		}
		$result = $this->mysqli->query("SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '$this->db_name' AND TABLE_NAME = '$table_name' AND COLUMN_NAME != 'id' AND REFERENCED_TABLE_NAME IS NOT NULL");
		if($result->num_rows > 0){
			$ret['pull_from'] = $result->fetch_all(MYSQLI_ASSOC);
		}
		return $ret;
	}

	public function describe_table($table_name){
		if($this->connect()){
			$result = $this->mysqli->query("DESCRIBE $table_name");
			if($result->num_rows > 0){
				$ret = [];
				$ret['description'] = $result->fetch_all(MYSQLI_ASSOC);
				$ret['indexes'] = $this->get_indexes($table_name);
				$ret['foreign_keys'] = $this->get_foreign_keys($table_name);
				
				$this->data = [
					'type' => 'success',
					'data' => $ret,
				];
				
			}else{
				$this->data = [
					'type' => 'error',
					'data' => 'Could not find any column',
				];
			}
		}else{
			$this->data = [
				'type' => 'error',
				'data' => 'Could not connect',
			];
		}
		$this->disconnect();
	}

	public function generate_all_table_description(){
		if($this->connect()){
			$result = $this->mysqli->query("SHOW TABLES");
			if($result->num_rows > 0){
				$table_list = array_map(function($el){
						return $el[0];
					}, $result->fetch_all());
				$tables = [];
				foreach($table_list as $table_name){
					$result = $this->mysqli->query("DESCRIBE $table_name");
					$ret = ['table_name' => $table_name];
					if($result->num_rows > 0){
						$ret['description'] = $result->fetch_all(MYSQLI_ASSOC);
						$ret['indexes'] = $this->get_indexes($table_name);
						$ret['foreign_keys'] = $this->get_foreign_keys($table_name);
					}else{
						$ret['description'] = null;
						$ret['indexes'] = null;
						$ret['foreign_keys'] = null;
					}
					$tables[] = $ret;
				}
				$this->data = [
					'type' => 'success',
					'data' => $tables,
				];
			}else{
				$this->data = [
					'type' => 'error',
					'data' => 'Could not find any table',
				];
			}
		}else{
			$this->data = [
				'type' => 'error',
				'data' => 'Could not connect',
			];
		}
		$this->disconnect();
	}
}
// $server = new Server('root', '', 'isp_billing');
// $server->describe_table('vouchers');
// die();
$username = (isset($_POST['db_username']))?$_POST['db_username']:'root';
$password = (isset($_POST['db_password']))?$_POST['db_password']:'';
$db_name = '';
if(isset($_POST['action']) && !empty($_POST['action'])){
	if(isset($_POST['db_name']) && !empty($_POST['db_name'])){
		$db_name = $_POST['db_name'];
		$server = new Server($username, $password, $db_name);
		switch ($_POST['action']) {
			case 'show_tables':
				$server->show_tables();
				break;
			case 'describe_table':
				if(isset($_POST['table_name']) && !empty($_POST['table_name'])){
					$server->describe_table($_POST['table_name']);
				}else{
					header("Content-Type: Application/json");
					echo json_encode([
							'type' => 'error',
							'data' => 'Table Name Required',
						]);
				}
				break;
			case 'generate_all_table_description':
				$server->generate_all_table_description();
				break;
			default:
				header("Content-Type: Application/json");
				echo json_encode([
						'type' => 'error',
						'data' => 'Action Not Found',
					]);
				break;
		}
	}else if($_POST['action'] == 'show_databases'){
		$server = new Server($username, $password);
		$server->show_databases();
	}else{
		header("Content-Type: Application/json");
		echo json_encode([
				'type' => 'error',
				'data' => 'Database Name Required',
			]);
	}
}
