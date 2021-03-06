#!/bin/bash
# Copyright (c) 2011 The Native Client Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# nacl-libtommath-0.41.sh
#
# usage:  nacl-libtommath-0.41.sh
#
# this script downloads, patches, and builds libtommath for Native Client
#

readonly URL=http://commondatastorage.googleapis.com/nativeclient-mirror/nacl/ltm-0.41.tar.bz2
#readonly URL=http://sourceforge.net/projects/tommath/files/libtommath/0.41/ltm-0.41.tar.bz2/download
readonly PATCH_FILE=libtommath-0.41.patch
readonly PACKAGE_NAME=libtommath-0.41

source ../../build_tools/common.sh


CustomBuildStep() {
  Banner "Building ${PACKAGE_NAME}"
  ChangeDir ${NACL_PACKAGES_REPOSITORY}/${PACKAGE_NAME}
  export CC=${NACLCC}
  export CXX=${NACLCXX}
  export AR=${NACLAR}
  export LD=${NACLLD}
  export RANLIB=${NACLRANLIB}

  # make clean + make
  DefaultBuildStep

  # To run tests, build with make -j4 test. Then using mtest from non-NaCl build
  # run the following:
  #   mtest/mtest | sel_ldr test.nexe
  # make -j4
}


CustomInstallStep() {
  # copy libs and headers manually
  Banner "Installing ${PACKAGE_NAME} to ${NACL_SDK_USR}"
  ChangeDir ${NACL_SDK_USR_INCLUDE}
  Remove ${PACKAGE_NAME}
  MakeDir ${PACKAGE_NAME}
  readonly THIS_PACKAGE_PATH=${NACL_PACKAGES_REPOSITORY}/${PACKAGE_NAME}
  cp ${THIS_PACKAGE_PATH}/*.h ${PACKAGE_NAME}/
  ChangeDir ${NACL_SDK_USR_LIB}
  cp ${THIS_PACKAGE_PATH}/*.a .
  DefaultTouchStep
}


CustomPackageInstall() {
  DefaultPreInstallStep
  DefaultDownloadBzipStep
  DefaultExtractBzipStep
  DefaultPatchStep
  CustomBuildStep
  CustomInstallStep
  DefaultCleanUpStep
}


CustomPackageInstall
exit 0
