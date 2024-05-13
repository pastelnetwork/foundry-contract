<?php
function siblingIndex($i) {
  return $i > 0 ? $i - ($i % 2 == 0 ? 1 : -1) : 0;
}
function parentIndex($i) {
  return $i > 0 ? floor(($i - 1) / 2) : 0;
}

function generateMerkleProof($stage, $address) {
  $jsonData = file_get_contents($stage . '.json');
  $data = json_decode($jsonData, true);
  foreach ($data["values"] as $key) {
    if ($key["value"][0] == $address) {
      $tree = $data["tree"];
      $proof = [];
      $index = $key["treeIndex"];
      while ($index > 0) {
        $proof[] = $tree[siblingIndex($index)];
        $index = parentIndex($index);
      }
      return $proof;
    }
  }
}

echo json_encode(generateMerkleProof($_GET["stage"], $_GET["address"]));
?>